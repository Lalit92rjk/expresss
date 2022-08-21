
document.addEventListener('DOMContentLoaded',renderOrderPage)

function renderOrderPage(){
    const orderDiv=document.getElementById('orderDiv')
    orderDiv.innerHTML=''
    axios.get('http://43.205.207.200:3000/orders')
    .then(response=>{
        response.data.orders.reverse().forEach(order => {
            const orderBox=document.createElement('div')
            orderBox.style='align-items:center;'
            orderBox.innerHTML=`<br><h3>Order ID : ${order.id}</h3>`

            order.products.forEach(product=>{
                 const productsBox=document.createElement('div')
                productsBox.innerHTML=`
                <div> <img src="${product.imageUrl}" alt="Image not Found"> </div>  
                <span> <h4>${product.title}</h4> </span> 
                <span style="margin-right:10px">Price :$${product.price} </span> 
                <span> Quantity: ${product.orderItem.quantity} </span>
                <br>
                `
                orderBox.appendChild(productsBox)

                
            })
            
            orderDiv.appendChild(orderBox)
            //orderDiv.appendChild(document.createTextNode(`Amount: ${order.amount}`))

            
        });
    })


}