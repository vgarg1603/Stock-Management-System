import { MongoClient } from "mongodb"
import { NextResponse } from "next/server"

export async function GET(request) {
    const query = request.nextUrl.searchParams.get("query")

    const uri = "<YOUR_CONNECTION_STRING>"

    const client = new MongoClient(uri)

    try {
        const database = client.db('stock')
        const inventory = database.collection('inventory')



        const products = await inventory.aggregate([
            {
                $match: {
                    $or: [
                        { productSlug: { $regex: query, $options: "i" } }, // Case-insensitive match for productSlug
                    ]
                }
            }
        ]).toArray();

        return NextResponse.json({success: true, products})
    } catch(error) {
        console.error(error);
        return NextResponse.json({success: false})
    } finally {
        await client.close()
    }
}
