-- Active: 1697310833193@@127.0.0.1@3306

CREATE TABLE
    users (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT (DATETIME()) NOT NULL
    );

INSERT INTO
    users (
        id,
        name,
        email,
        password,
        created_at
    )
VALUES (
        'user1',
        'Nome do Usuário 1',
        'usuario1@email.com',
        'senha1',
        datetime('now', 'localtime')
    ), (
        'user2',
        'Nome do Usuário 2',
        'usuario2@email.com',
        'senha2',
        datetime('now', 'localtime')
    ), (
        'user3',
        'Nome do Usuário 3',
        'usuario3@email.com',
        'senha3',
        datetime('now', 'localtime')
    );

CREATE TABLE
    products (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL
    );

drop TABLE products;

INSERT INTO
    products (
        id,
        name,
        price,
        description,
        image_url
    )
VALUES (
        'product1',
        'Produto 1',
        19.99,
        'Descrição do Produto 1',
        'url_imagem1.jpg'
    ), (
        'product2',
        'Produto 2',
        29.99,
        'Descrição do Produto 2',
        'url_imagem2.jpg'
    ), (
        'product3',
        'Produto 3',
        39.99,
        'Descrição do Produto 3',
        'url_imagem3.jpg'
    ), (
        'product4',
        'Produto 4',
        49.99,
        'Descrição do Produto 4',
        'url_imagem4.jpg'
    ), (
        'product5',
        'Produto 5',
        59.99,
        'Descrição do Produto 5',
        'url_imagem5.jpg'
    );

CREATE TABLE
    purchases (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        buyer TEXT NOT NULL,
        total_price REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (DATETIME()),
        FOREIGN KEY (buyer) REFERENCES users (id) ON DELETE CASCADE
    );

DROP TABLE purchases 

INSERT INTO
    purchases (
        id,
        buyer,
        total_price,
        created_at
    )
VALUES (
        'pedido1',
        'user7',
        1996,
        datetime('now', 'localtime')
    );

INSERT INTO
    purchases (
        id,
        buyer,
        total_price,
        created_at
    )
VALUES (
        'pedido2',
        'user7',
        1997,
        datetime('now', 'localtime')
    );

INSERT INTO
    purchases (
        id,
        buyer,
        total_price,
        created_at
    )
VALUES (
        'pedido3',
        'user7',
        1998,
        datetime('now', 'localtime')
    );

SELECT
    p.id AS id_da_compra,
    u.id AS id_de_quem_fez_a_compra,
    u.name AS nome_de_quem_fez_a_compra,
    u.email AS email_de_quem_fez_a_compra,
    p.total_price AS preco_total_da_compra,
    p.created_at AS data_da_compra
FROM purchases p
    JOIN users u ON p.buyer = u.id
WHERE p.id = 'pedido1';

CREATE TABLE
    purchases_products (
        purchase_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (purchase_id) REFERENCES purchases (id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE
    );

drop table purchases_products;

INSERT INTO
    purchases_products (
        purchase_id,
        product_id,
        quantity
    )
VALUES ('pedido1', 'product1', 5), ('pedido2', 'product2', 2), ('pedido3', 'product1', 2);

SELECT pp.*, p.*, pu.*
FROM purchases_products AS pp
    INNER JOIN purchases AS pu ON pp.purchase_id = pu.id
    INNER JOIN products AS p ON pp.product_id = p.id;