import express, {Request, Response} from "express"
import cors from "cors"
import {db} from "./database/knex"
import {TProductDB, TPurchaseDB, TUserDB} from "./types"

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`)
})

// Middleware para permitir o uso do body parser
app.use(express.json())

//                         ENDPOINT USERS
// Get all users
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await db.select("*").from("users")
    res.status(200).json(users)
  } catch (error) {
    console.log(error)

    if (req.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send("Erro inesperado")
    }
  }
})

//Create user
app.post("/users", async (req: Request, res: Response) => {
  try {
    const {id, name, email, password} = req.body

    if (typeof id !== "string") {
      res.status(400)
      throw new Error("id deve ser string")
    }

    if (id.length < 4) {
      res.status(400)
      throw new Error("Name deve possuir pelo menos 4 caracteres")
    }
    if (typeof name !== "string") {
      res.status(400)
      throw new Error("id deve ser string")
    }

    if (name.length < 2) {
      res.status(400)
      throw new Error("Name deve possuir pelo menos 2 caracteres")
    }

    if (typeof email !== "string") {
      res.status(400)
      throw new Error("id deve ser string")
    }

    if (email.length < 2) {
      res.status(400)
      throw new Error("Email deve possuir pelo menos 4 caracteres")
    }

    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
      )
    ) {
      throw new Error(
        "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial"
      )
    }

    const [userIdAlreadyExists]: TUserDB[] | undefined[] = await db(
      "users"
    ).where({id})

    if (userIdAlreadyExists) {
      res.status(400)
      throw new Error("User already exists")
    }

    const [userEmailAlreadyExists]: TUserDB[] | undefined[] = await db(
      "users"
    ).where({email})

    if (userEmailAlreadyExists) {
      res.status(400)
      throw new Error("Email already exists")
    }
    const currentDatetime = new Date().toISOString()

    const newUser: TUserDB = {
      id,
      name,
      email,
      password,
      created_at: currentDatetime,
    }

    await db("users").insert(newUser)

    res
      .status(201)
      .send({message: "Cadastro realizado com sucesso", user: newUser})
  } catch (error) {
    console.log(error)

    if (req.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send("Erro inesperado")
    }
  }
})

//Delete User by id
app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id

    const existingUser = await db("users").where("id", userId).first()

    if (!existingUser) {
      return res.status(404).json({error: "Usuário não encontrado."})
    }

    await db.delete().from("users").where({id: userId})
    res.status(200).send({
      message: "Usuário deletado com sucesso.",
    })
  } catch (error) {
    console.log(error)

    if (res.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send("Erro inesperado")
    }
  }
})

//                         ENDPOINT PRODUDCTS
// Get all products funcionalidades 1
app.get("/products", async (req: Request, res: Response) => {
  try {
    const {name} = req.query

    let query = db.select("*").from("products")

    if (name) {
      // Se o parâmetro 'name' foi fornecido, aplique um filtro na consulta
      query.where("name", "like", `%${name}%`)
    }

    const products = await query
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({error: "Erro interno do servidor."})
  }
})

// Get all products funcionalidades 2
app.get("/products", async (req: Request, res: Response) => {
  try {
    const {name} = req.query

    if (name) {
      // Use uma consulta parametrizada para evitar injeção de SQL
      const products = await db.raw(
        "SELECT * FROM products WHERE name LIKE :name",
        {
          name: `%${name}%`,
        }
      )
      res.status(200).json(products[0])
    } else {
      const products = await db.raw("SELECT * FROM products")
      res.status(200).json(products[0])
    }
  } catch (error) {
    res.status(500).json({error: "Erro interno do servidor."})
  }
})

// Create product
app.post("/products", async (req: Request, res: Response) => {
  try {
    const {id, name, price, description, image_url} = req.body

    if (!id || !name || !price || !description || !image_url) {
      return res.status(400).json({error: "Todos os campos são obrigatórios."})
    }

    // Verifica se já existe um produto com o mesmo ID
    const [existingProduct]: TProductDB[] | undefined[] = await db(
      "products"
    ).where({id})

    if (existingProduct) {
      return res
        .status(400)
        .json({error: "Já existe um produto com o mesmo ID."})
    }

    // Insere o novo produto na tabela 'products'
    //await db("products").insert({
    const newProduct: TProductDB = {
      id,
      name,
      price,
      description,
      image_url,
    }

    // Obtém o novo produto após a inserção
    await db("products").insert(newProduct)

    res
      .status(201)
      .send({message: "Produto criado com sucesso", product: newProduct})
  } catch (error) {
    console.error(error)
    res.status(500).json({error: "Erro interno do servidor."})
  }
})

//Edit product by id
app.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const idToEdit = req.params.id

    const newId = req.body.id
    const newName = req.body.name
    const newPrice = req.body.price
    const newDescription = req.body.description
    const newImageUrl = req.body.image_url

    if (newId !== undefined) {
      if (typeof newId !== "string") {
        res.status(400)
        throw new Error("'id' deve ser string")
      }

      if (newId.length < 4) {
        res.status(400)
        throw new Error("'ID' deve possuir pelo menos 4 caracteres")
      }
    }

    if (newName !== undefined) {
      if (typeof newName !== "string") {
        res.status(400)
        throw new Error("'Nome' deve ser string")
      }

      if (newName.length < 4) {
        res.status(400)
        throw new Error("'Nome' deve possuir pelo menos 4 caracteres")
      }
    }

    if (newPrice !== undefined) {
      if (typeof newPrice !== "number") {
        res.status(400)
        throw new Error("'Price' deve ser number")
      }
    }

    if (newDescription !== undefined) {
      if (typeof newDescription !== "string") {
        res.status(400)
        throw new Error("'description' deve ser string")
      }
    }

    if (newImageUrl !== undefined) {
      if (typeof newImageUrl !== "string") {
        res.status(400)
        throw new Error("'ImageUrl' deve ser string")
      }
    }

    const [product]: TProductDB[] | undefined[] = await db("products").where({
      id: idToEdit,
    })

    if (!product) {
      res.status(404)
      throw new Error("'id' não encontrada")
    }

    const newProduct: TProductDB = {
      id: newId || product.id,
      name: newName || product.name,
      price: newPrice || product.price,
      description: newDescription || product.description,
      image_url: newImageUrl || product.image_url,
    }

    await db("products").update(newProduct).where({id: idToEdit})

    res.status(200).send({
      message: "Produto editado com sucesso",
      product: newProduct,
    })
  } catch (error) {
    console.log(error)

    if (req.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send("Erro inesperado")
    }
  }
})
//                          ENDPOINT PURCHASES

// Get all purchases
app.get("/purchases", async (req: Request, res: Response) => {
  try {
    const purchases = await db("purchases").select("*") // Recupere todos os registros da tabela 'purchases'

    res.status(200).json(purchases) // Responda com os registros de compras em formato JSON
  } catch (error) {
    console.error(error)
    res.status(500).json({error: "Erro interno do servidor"})
  }
})

// Create purchase
app.post("/purchases", async (req: Request, res: Response) => {
  try {
    const {id, buyer, products} = req.body

    if (!id || !buyer || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({error: "Requisição inválida."})
    }

    const existingUser = await db("users").where("id", buyer).first()

    if (!existingUser) {
      return res.status(404).json({error: "Comprador não encontrado."})
    }

    const existingPurchase = await db("purchases").where("id", id).first()

    if (existingPurchase) {
      return res.status(400).json({error: "ID de compra já existe."})
    }

    const productIds = products.map((product) => product.id)
    const existingProducts = await db("products").whereIn("id", productIds)

    if (existingProducts.length !== products.length) {
      return res
        .status(404)
        .json({error: "Um ou mais produtos não foram encontrados."})
    }

    const total_price = products.reduce((total, product) => {
      const existingProduct = existingProducts.find((p) => p.id === product.id)
      return total + existingProduct.price * product.quantity
    }, 0)

    const currentDatetime = new Date().toISOString()

    const newPurchase = {
      id,
      buyer,
      total_price,
      created_at: currentDatetime,
    }

    await db("purchases").insert(newPurchase)

    await Promise.all(
      products.map(async (product) => {
        await db("purchases_products").insert({
          purchase_id: id,
          product_id: product.id,
          quantity: product.quantity,
        })
      })
    )

    const response = {
      message: "Pedido realizado com sucesso",
      purchase: newPurchase,
      products: products,
    }

    res.status(201).json(response)
  } catch (error) {
    console.log(error)

    if (res.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send("Erro inesperado")
    }
  }
})

//Get purchase by id
app.get("/purchases/:id", async (req: Request, res: Response) => {
  try {
    const {id} = req.params

    const purchase = await db("purchases").where("id", id).first()

    if (!purchase) {
      return res.status(404).json({error: "Pedido não encontrado"})
    }

    const products = await db("purchases_products as pp")
      .select(
        "p.id",
        "p.name",
        "p.price",
        "p.description",
        "p.image_url",
        "pp.quantity"
      )
      .where("pp.purchase_id", id)
      .join("products as p", "p.id", "pp.product_id")

    const response = {
      purchaseId: purchase.id,
      buyerId: purchase.buyer,
      buyerName: purchase.buyer_name,
      buyerEmail: purchase.buyer_email,
      totalPrice: purchase.total_price,
      createdAt: purchase.created_at,
      products,
    }

    res.status(200).send(response)
  } catch (error) {
    console.log(error)

    if (req.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send("Erro inesperado")
    }
  }
})
//Delete purchase by id
app.delete("/purchases/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id

    const purchaseToDelete = await db("purchases")
      .where("id", idToDelete)
      .first()

    if (!purchaseToDelete) {
      res.status(404)
      throw new Error("'id' não encontrado")
    }

    await db.delete().from("purchases").where({id: idToDelete})
    res.status(200).send({
      message: "Pedido cancelado com sucesso",
    })
  } catch (error) {
    console.log(error)

    if (res.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send("Erro inesperado")
    }
  }
})
