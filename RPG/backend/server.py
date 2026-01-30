import mysql.connector
from mysql.connector import Error
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configurações do Banco centralizadas
DB_CONFIG = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "Lorenzo170401.",
    "database": "meu_rpg",
    "port": 3306
}

def get_db_connection():
    """Cria uma conexão com tratamento de erro."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            return conn
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None
    
@app.route('/api/carregar-jogador', methods=['GET'])
def carregar_jogador():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM jogador WHERE id = 1")
    dados = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(dados)

@app.route('/api/salvar-jogador', methods=['POST'])
def salvar_jogador():
    dados = request.json
    print(f"DEBUG: Recebi dados do JS: {dados}") # Isso vai aparecer no terminal do Python
    
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE jogador SET pos_x = %s, pos_y = %s WHERE id = 1"
    cursor.execute(sql, (dados['pos_x'], dados['pos_y']))
    conn.commit()
    
    print(f"DEBUG: Linhas afetadas: {cursor.rowcount}")
    cursor.close()
    conn.close()
    return jsonify({"status": "sucesso"})

@app.route('/api/monstro-aleatorio', methods=['GET'])
def get_monstro():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Erro na conexão com o banco de dados"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        # Busca um monstro aleatório
        cursor.execute("SELECT * FROM monstros ORDER BY RAND() LIMIT 1")
        monstro = cursor.fetchone()
        
        if not monstro:
            return jsonify({"error": "Nenhum monstro encontrado no banco"}), 404
            
        return jsonify(monstro)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Garante que a conexão será fechada mesmo se houver erro no SELECT
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    # Threaded=True permite que o Flask lide com múltiplas requisições simultâneas
    app.run(debug=True, port=5000, threaded=True)
