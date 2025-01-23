'use client'
import Header from "@/components/Header";
import { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast, Slide } from 'react-toastify';

export default function Home() {

  const [query, setQuery] = useState('')

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [dropdown, setDropdown] = useState([])
  const [loadingAction, setLoadingAction] = useState(false)

  const [productForm, setProductForm] = useState({
    productSlug: "",
    quantity: "",
    price: "",
  })

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/product');
      const rjson = await response.json();
      setProducts(rjson.products);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching products.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  }, []);


  useEffect(() => {
    fetchProducts()
  }, [])


  const handleProductChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value })
  }

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.productSlug || !productForm.quantity || !productForm.price) {
      toast.error("All fields are required.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    try {
      const response = await fetch('/api/product', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productForm)
      })

      if (response.ok) {
        console.log("Product added successfully")
        toast.success('Product added successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Slide,
        });
      }
      else {
        console.error("Error adding product")
        toast.error('Error Adding Product', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Slide,
        });
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      setProductForm({
        productSlug: "",
        quantity: "",
        price: "",
      });

      fetchProducts()
    }
  }

  const onDropdown = async (e) => {
    const queryValue = e.target.value;
    setQuery(queryValue);

    // Reset the dropdown if the input is empty or contains only whitespace
    if (!queryValue.trim()) {
      setDropdown([]);
      setLoading(false);
      return;
    }

    setDropdown([]);
    setLoading(true); // Start loading before fetching

    try {
      const response = await fetch(`/api/search?query=${queryValue}`);
      const rjson = await response.json();
      setDropdown(rjson.products); // Populate dropdown with fetched products
    } catch (error) {
      console.error(error);
      toast.error("Error fetching search results.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false); // End loading after fetching
    }
  };

  const buttonAction = async (action, productSlug, initialQuantity) => {

    // Immediately change quantity of productSlug in products

    let index = products.findIndex((item) => item.productSlug == productSlug)

    let newProducts = JSON.parse(JSON.stringify(products))
    if (action == "plus") {
      newProducts[index].quantity = parseInt(initialQuantity) + 1
    }
    else {
      newProducts[index].quantity = parseInt(initialQuantity) - 1
    }

    setProducts(newProducts)

    let indexDrop = dropdown.findIndex((item) => item.productSlug == productSlug)

    let newProductsDropdown = JSON.parse(JSON.stringify(dropdown))
    if (action == "plus") {
      newProductsDropdown[index].quantity = parseInt(initialQuantity) + 1
    }
    else {
      newProductsDropdown[index].quantity = parseInt(initialQuantity) - 1
    }

    setDropdown(newProductsDropdown)


    setLoadingAction(true)

    try {
      const response = await fetch('/api/action', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, productSlug, initialQuantity })
      })

      let r = await response.json()

      console.log(r)

    } catch (error) {
      console.error(error)
    }
    finally {
      setLoadingAction(false)
    }



  }


  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
      <Header />



      {/* Main Container */}
      <div className="w-[95%] bg-gray-100 mx-auto rounded-lg shadow-lg p-6">

        {/* Search Section */}
        <div>


          <h1 className="text-2xl font-bold text-gray-800 text-center">Search</h1>
          <div className="relative mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              onChange={onDropdown}
              className=" w-full sm:w-[60%] border rounded-lg py-2 px-4 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              type="text"
              placeholder="Search for a product"
            />

            <select
              className="w-full sm:w-[30%] border rounded-lg py-2 px-4 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="all">All Products</option>
              <option value="name">By Name</option>
              <option value="category">By Category</option>
              <option value="price">By Price</option>
            </select>





            {dropdown && dropdown.length > 0 && (

              <div className="w-full absolute left-12 top-9 mt-4 bg-white shadow-lg rounded-lg max-w-[90%] md:max-w-[60%] mx-auto border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 p-4 bg-gray-50 border-b">
                  Search Results
                </h2>
                <div className="divide-y">
                  {dropdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-800 font-medium truncate w-1/3">
                        {item.productSlug}
                      </span>
                      <span className="text-gray-600 w-1/3 text-center">
                        ${item.price}
                      </span>


                      <div className="text-gray-500 w-1/3 md:w-[28%] text-right flex justify-between items-center">
                        <button onClick={() => { buttonAction("minus", item.productSlug, item.quantity) }} disabled={loadingAction} className="disabled:bg-blue-200 hover:cursor-pointer hover:bg-blue-300 rounded-full px-2 text-center">
                          -
                        </button>

                        <span>
                          Qty: {item.quantity}
                        </span>
                        <button onClick={() => { buttonAction("plus", item.productSlug, item.quantity) }} disabled={loadingAction} className="disabled:bg-blue-200 hover:cursor-pointer hover:bg-blue-300 rounded-full px-2 text-center">
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Section */}

        {loading && (
          <div className="mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              style={{ margin: "auto", background: "none", display: "block" }}
              width="50px"
              height="50px"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid"
            >
              <circle
                cx="50"
                cy="50"
                fill="none"
                stroke="#000"
                strokeWidth="8"
                r="35"
                strokeDasharray="164.93361431346415 56.97787143782138"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  repeatCount="indefinite"
                  dur="1s"
                  values="0 50 50;360 50 50"
                  keyTimes="0;1"
                ></animateTransform>
              </circle>
            </svg>
          </div>
        )}





        {/* Add Product Section */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mt-10">Add a Product</h1>
        <form className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Product Name */}
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="productSlug"
              >
                Product Slug
              </label>
              <input
                onChange={handleProductChange}
                className="w-full border rounded-lg py-2 px-4 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                id="productSlug"
                name="productSlug"
                type="text"
                value={productForm.productSlug}
                placeholder="Enter product name"
              />
            </div>

            {/* Quantity */}
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="quantity"
              >
                Quantity
              </label>
              <input
                onChange={handleProductChange}
                className="w-full border rounded-lg py-2 px-4 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                id="quantity"
                name="quantity"
                type="number"
                value={productForm.quantity}
                placeholder="Enter quantity"
              />
            </div>

            {/* Price */}
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="price"
              >
                Price
              </label>
              <input
                onChange={handleProductChange}
                className="w-full border rounded-lg py-2 px-4 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                id="price"
                name="price"
                type="number"
                value={productForm.price}
                placeholder="Enter price"
              />
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={handleAddProduct}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="button"
            >
              Add Product
            </button>
          </div>
        </form>



        {/* Stock Display Section */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mt-10">
          Current Stock
        </h1>
        <div className="overflow-x-auto">
          <table className="table-auto w-full mt-6 bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-500 text-white text-lg">
                <th className="px-6 py-3 text-left">Product Name</th>
                <th className="px-6 py-3 text-left">Quantity</th>
                <th className="px-6 py-3 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {products && products.map((item, index) => {
                return <tr key={index} className={`border-b hover:bg-gray-200 ${index % 2 ? 'bg-white' : 'bg-gray-100'}`}>
                  <td className="px-6 py-4">{item.productSlug}</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">${item.price}</td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
