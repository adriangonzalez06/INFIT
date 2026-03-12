import sys
import os
import torch
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import HuggingFacePipeline
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_classic.chains.retrieval_qa.base import RetrievalQA
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# Configuración de rutas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIETAS_DIR = os.path.join(BASE_DIR, "IA pdfs", "dietas")
EJERCICIOS_DIR = os.path.join(BASE_DIR, "IA pdfs", "ejercicios")
TXT_DOC = os.path.join(BASE_DIR, "Spider-Man.txt")
INDEX_PATH = os.path.join(BASE_DIR, "faiss_index")

def load_documents():
    documents = []
    
    # Cargar TXT principal
    if os.path.exists(TXT_DOC):
        loader = TextLoader(TXT_DOC, encoding="utf-8")
        documents.extend(loader.load())
    
    # Cargar PDFs de dietas
    if os.path.exists(DIETAS_DIR):
        for file in os.listdir(DIETAS_DIR):
            if file.endswith(".pdf"):
                file_path = os.path.join(DIETAS_DIR, file)
                try:
                    loader = PyPDFLoader(file_path)
                    documents.extend(loader.load())
                except Exception as e:
                    print(f"Error cargando {file}: {e}", file=sys.stderr)

    # Cargar PDFs de ejercicios
    if os.path.exists(EJERCICIOS_DIR):
        for file in os.listdir(EJERCICIOS_DIR):
            if file.endswith(".pdf"):
                file_path = os.path.join(EJERCICIOS_DIR, file)
                try:
                    loader = PyPDFLoader(file_path)
                    documents.extend(loader.load())
                except Exception as e:
                    print(f"Error cargando {file}: {e}", file=sys.stderr)
                    
    return documents

def get_knowledge_base():
    embedding_model = HuggingFaceEmbeddings(model_name="thenlper/gte-small")
    
    if os.path.exists(INDEX_PATH):
        # Cargar índice persistido
        return FAISS.load_local(INDEX_PATH, embedding_model, allow_dangerous_deserialization=True)
    else:
        # Crear nuevo índice
        print("Creando índice de conocimiento (esto puede tardar unos minutos)...", file=sys.stderr)
        documents = load_documents()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        chunks = text_splitter.split_documents(documents)
        
        knowledge_base = FAISS.from_documents(chunks, embedding_model)
        knowledge_base.save_local(INDEX_PATH)
        return knowledge_base

def create_llm():
    model_id = "sshleifer/tiny-gpt2"
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(model_id)

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    llm_pipeline = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        max_new_tokens=100,
        truncation=True,
        max_length=250,
        temperature=0.3,
        top_k=50,
        device=0 if torch.cuda.is_available() else -1,
    )
    return HuggingFacePipeline(pipeline=llm_pipeline)

def main():
    if len(sys.argv) < 2:
        print("Error: No se proporcionó ninguna pregunta.")
        sys.exit(1)

    query = sys.argv[1]

    try:
        kb = get_knowledge_base()
        llm = create_llm()
        
        retriever = kb.as_retriever(search_type="similarity", search_kwargs={"k": 3})
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=False
        )
        
        result = qa_chain.invoke(query)
        answer = result['result'].strip()
        print(answer)

    except Exception as e:
        print(f"Error en el motor de IA: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
