import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";


export async function POST(request) {

    let { action, productSlug, initialQuantity } = await request.json()

    const uri = "mongodb+srv://mongodb:veugp5s4vtgvQfYu@cluster0.mlejt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);

    try {
        const database = client.db("stock")
        const inventory = database.collection("inventory")

        const filter = { productSlug: productSlug }

        let newQuantity = action == "plus" ? (parseInt(initialQuantity) + 1) : (parseInt(initialQuantity) - 1);

        const updateDoc = {
            $set: {
                quantity: newQuantity,
            }
        }

        const result = await inventory.updateOne(filter, updateDoc)
        console.log(`${result.matchedCount} documents matched the filter, updated ${result.modifiedCount} document`)
        return NextResponse.json({success: true, result})
    } finally {
        await client.close()
    }
}