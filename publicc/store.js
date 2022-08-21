const cart_items = document.querySelector('#cart .cart-items');

window.addEventListener('DOMContentLoaded', () => {
    console.log('data');
    displayProducts();

    axios.get('http://43.205.207.200:3000/products').then((data) => {
        console.log(data);
        if(data.request.status === 200) {
            const products = data.data.products;
            const parentSection = document.getElementById('Products');
            products.forEach(product => {
                const productHtml = `
                <div id="album-${product.id}">
                    <h3>${product.title}</h3>
                    <div class="image-container">
                        <img class="prod-images" src=${product.imageUrl} alt="">
                    </div>
                        <div class="prod-details">
                        <span>$<span>${product.price}</span></span>
                    <button onClick="addToCart(${product.id})"> Add To Cart </button>
                    </div>
                    
                </div>`
                parentSection.innerHTML += productHtml;
            })
        }
        
    })

})

function addToCart(productId) {
    axios.post('http://43.205.207.200:3000/cart', {productId: productId})
        .then(response =>{
            if(response.status === 200) {
                notifyUsers(response.data.message);
            } else {
                throw new Error(response.data.message);
            }
        })
        .catch(errMsg => {
            console.log(errMsg);
            notifyUsers(errMsg);
        })
}

function getCartDetails() {
    axios.get('http://43.205.207.200:3000/cart')
        .then(response => {
            if(response.status === 200) {
                response.data.products.forEach(product => {
                    const cartContainer = document.getElementById('cart');
                   /*cartContainer.innerHTML += `<li>${product.title} - ${product.price} - ${product.cartItem.quantity}</li>`*/
                })
                document.querySelector('#cart').style = "display:block;"
            } else {
                throw new Error('Something went wrong')
            }

            // console.log(response);
        })
        .catch(error => {
            notifyUsers(error);
        })
}

function notifyUsers(message) {
    const container = document.getElementById('container');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `<h4>${message}<h4>`;
    container.appendChild(notification);
    setTimeout(()=>{
        notification.remove();
    },2500)
}




document.addEventListener('click',(e)=>{

    if (e.target.className=='cart-btn-bottom' || e.target.className=='cart-bottom' || e.target.className=='cart-holder'){
      
        getCartDetails();
        displayInCart();
        
    }
    if (e.target.className=='cancel'){
        document.querySelector('#cart').style = "display:none;"
    }


    if (e.target.innerText=='REMOVE'){
        axios.post('http://43.205.207.200:3000/cart-delete-item',{'productId':e.target.parentNode.parentNode.id.substring(8)})
        .then(response=>{
        removeFromFrontendCart(e)
        notifyUsers(response.data.message);  
        })
        .catch(errmsg=>{
        console.log(errmsg)
        })

    }


    if (e.target.className=='purchase-btn'){
        if (parseInt(document.querySelector('.cart-number').innerText) === 0){
            alert('You have Nothing in Cart , Add some products to purchase !');
        }
        else{
            axios.post('http://43.205.207.200:3000/order-place')
            .then((response)=>{
                notifyUsers(response.data.message);
                const cart_items = document.querySelector('#cart .cart-items');
                cart_items.innerHTML = ""
                document.querySelector('.cart-number').innerText = '0'
                document.querySelector('#total-value').innerText = '0';
            })
        }

    }
})




function removeFromFrontendCart(event){
    let total_cart_price = document.querySelector('#total-value').innerText;
    let item_price=document.querySelector(`#${event.target.parentNode.parentNode.id} .cart-price`).innerText;
    let item_quantity=event.target.parentNode.firstElementChild.value;

    total_cart_price = parseFloat(total_cart_price).toFixed(2) - (parseFloat(item_price).toFixed(2) * parseInt(item_quantity)) ;
    document.querySelector('.cart-number').innerText = parseInt(document.querySelector('.cart-number').innerText)-1
    document.querySelector('#total-value').innerText = `${total_cart_price.toFixed(2)}`
    event.target.parentNode.parentNode.remove()
}

  
//displaying products
function displayProducts(queryParams=''){
    axios.get(`http://43.205.207.200:3000/products/${queryParams}`)
    .then(result=>{
        const productsDisplayContainerDiv=document.getElementById('Products')
        productsDisplayContainerDiv.innerHTML='';
        result.data.products.forEach(product=>{
            const eachProduct=document.createElement('div');
            eachProduct.setAttribute('id',`p${product.id}`)
            eachProduct.innerHTML=`<h3>${product.title}</h3> 
            <div> <img src="${product.imageUrl}" alt="Image not Found"> </div>  
            <div> <p>${product.description}</p></div> 
            <div> 
                <span>$</span> 
                <span>${product.price} </span> 
                <span> <button onClick="addToCart(${product.id})"> Add To Cart </button> </span> 
            </div> 
            <br>`
            productsDisplayContainerDiv.appendChild(eachProduct)
        })
        
        pagination(result,document.getElementById('productPagination'),'Products');
    })
    .catch(err=>{
        console.log(err)
    })

}


//pagination
function pagination(response,container,place){
    let func;
    if(place=='cart')
    func='displayInCart'
    else if(place=='Products')
    func='displayProducts'

    container.innerHTML=`
    <span>
        <button id="${place}firstPage" onclick="${func}('?page=1')">1</button>
        <button id="${place}previousPage" onclick="${func}('?page=${response.data.previousPage}')">${response.data.previousPage}</button>
        <button id="${place}currentPage" onclick="${func}('?page=${response.data.currentPage}')" class="active">${response.data.currentPage}</button>
        <button id="${place}nextPage" onclick="${func}('?page=${response.data.nextPage}')">${response.data.nextPage}</button>
        <button id="${place}lastPage" onclick="${func}('?page=${response.data.lastPage}')">${response.data.lastPage}</button>
    </span>
    `
    const firstPage=document.getElementById(`${place}firstPage`);
    const currentPage=document.getElementById(`${place}currentPage`);
    const previousPage=document.getElementById(`${place}previousPage`);
    const nextPage=document.getElementById(`${place}nextPage`);
    const lastPage=document.getElementById(`${place}lastPage`);
    if(parseInt(currentPage.innerText)==1)
    firstPage.style='display:none'
    if(parseInt(previousPage.innerText)<1 || parseInt(previousPage.innerText)==firstPage.innerText)
    previousPage.style='display:none'
    if(parseInt(nextPage.innerText)>parseInt(lastPage.innerText))
    nextPage.style='display:none'
    if(parseInt(currentPage.innerText)==parseInt(lastPage.innerText) || parseInt(nextPage.innerText)==parseInt(lastPage.innerText) )
    lastPage.style='display:none'


}
//display in cart
function displayInCart(queryParams=''){
    axios.get(`http://43.205.207.200:3000/cart/${queryParams}`)
    .then(response=>{
        const cart_items = document.querySelector('#cart .cart-items');
        cart_items.innerHTML='';
        response.data.products.forEach((prod)=>{
        const cart_item = document.createElement('div');
        cart_item.classList.add('cart-row');
        cart_item.setAttribute('id',`in-cart-${prod.id}`)
        cart_item.innerHTML = `
        <span class='cart-item cart-column'>
        <img class='cart-img' src="${prod.imageUrl}" alt="">
            <span>${prod.title}</span>
        </span>
        <span class='cart-price cart-column'>${prod.price}</span>
        <span class='cart-quantity cart-column'>
        <input type="text" value="${prod.cartItem.quantity}">
        <button>REMOVE</button>
        </span>`
        cart_items.appendChild(cart_item)

        })
        //for amount and no. of products in cart
        let totalAmount=0;
        let totalproducts=0;

        response.data.allProducts.forEach((prod)=>{
            totalAmount+=(parseFloat(prod.price)*parseFloat(prod.cartItem.quantity))
            totalproducts++;
        })

        //pagination(response,document.getElementById('cartPagination'),'cart');
        document.querySelector('#cart').style = "display:block"
        document.querySelector('#total-value').innerText=totalAmount.toFixed(2);
        document.querySelector('.cart-number').innerText=totalproducts;


    })
    .catch(err=>{
        console.log(err)
    })
    
}