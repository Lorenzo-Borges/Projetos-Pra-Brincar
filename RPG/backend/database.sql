CREATE DATABASE meu_rpg;
USE meu_rpg;

CREATE TABLE monstros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    hp_max INT NOT NULL,
    ataque INT NOT NULL,
    defesa INT NOT NULL,
    sprite_path VARCHAR(100) -- Caminho da imagem do monstro
);

-- Vamos inserir alguns monstros para teste
INSERT INTO monstros (nome, hp_max, ataque, defesa, sprite_path) VALUES 
('Slime de Geléia', 20, 5, 2, 'assets/sprites/slime.png'),
('Morcego das Sombras', 15, 7, 1, 'assets/sprites/morcego.png'),
('Esqueleto Guerreiro', 40, 10, 5, 'assets/sprites/esqueleto.png');