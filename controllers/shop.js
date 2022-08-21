const Product = require('../models/product');
const Cart = require('../models/cart');

const items_per_page = 2;

exports.getProducts = (req, res, next) => {

  const page= (+req.query.page || 1);
  let total_items;
  Product.findAndCountAll({
    offset:(page-1)*items_per_page,
    limit:items_per_page
  })
  .then(response=>{
    total_items=response.count;
    res.status(200).json({
      total_item: total_items,
      hasNextPage: (page*items_per_page<total_items),
      hasPreviousPage: page>1,
      currentPage:page,
      nextPage:page+1,
      previousPage:page-1,
      lastPage:(Math.ceil(total_items/items_per_page)),
      products:response.rows

    })
  })
  .catch(err=>{
    console.log(err)
  })
};



exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let total_item;

  Product.findAndCountAll()
  .then(numProducts => {
    total_item = numProducts;
    return Product.findAll({
      offset: ((page - 1) * items_per_page),
      limit: (items_per_page)});
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      totalProducts: total_item,
      previousPage: page - 1,
      currentPage: page,
      hasNextPage: items_per_page * page < total_item,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      
      lastPage: Math.ceil(total_item / items_per_page)
    });  
  })
  .catch(err => {
    console.log(err);
  });
};

/*exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      return cart
        .getProducts()
        .then(products => {
          res.status(200).json({
            success: true,
            products: products
          })
          // res.render('shop/cart', {
          //   path: '/cart',
          //   pageTitle: 'Your Cart',
          //   products: products
          // });  
        })
        .catch(err => { res.status(500).json({ success: false, message: err }) });
    })
    .catch(err => res.status(500).json({ success: false, message: err }));
};*/

exports.getCart = (req, res, next) => {
  // req.user.getCart()
  // .then((cart)=>{
  //   return cart.getProducts();
  // })
  // .then((products)=>{
  //     res.render('shop/cart', {
  //     path: '/cart',
  //     pageTitle: 'Your Cart',
  //     products:products

  //   });
  // })
  // .catch(err=>{
  //   console.log(err)
  // })
  const items_per_page=2
  let total_items;
  let fetchedCart;
  let all_products;
  let page= +req.query.page || 1;
  req.user.getCart()
  .then((cart)=>{
      fetchedCart=cart
      return cart.countProducts()
  })
  .then((count)=>{
    total_items=count;
    return fetchedCart.getProducts();
  })
  .then((allProducts)=>{
    all_products=allProducts;
    return fetchedCart.getProducts({offset:(page-1)*items_per_page, limit:items_per_page})
  })
  .then(products=>{
    res.status(200).json({
      totalItems:total_items,
      
      allProducts:all_products,
      products:products,
      hasNextPage: (page*items_per_page<total_items),
      hasPreviousPage: page>1,
      currentPage:page,
      nextPage:page+1,
      previousPage:page-1,
      lastPage:(Math.ceil(total_items/items_per_page))

    })
  })
  .catch(()=>{
    res.status(500).json({success:false,message:'can not extract from cart'})
  })

};

exports.postCart = (req, res, next) => {
  if(!req.body.productId) {
    return res.status(400).json({ success: false, message: 'Product Id is missing' })
  }
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      if(products.length > 0) {
        product = products[0];
      }

      if(product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId)
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
     })
    .then(() => {
      res.status(200).json({ success: true, message: 'Successfully added the product'})
    })
    .catch(err => {
      res.status(500).json({ success: false, message: 'Error Occured'})
    });
};

/*exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};*/

exports.postDelete=(req,res,next)=>{
  if(!req.body.productId)
  return res.status(400).json({success:false,message:'Product Id missing'})
  const prodId=req.body.productId;
  req.user.getCart()
  .then((cart)=>{
    return cart.getProducts({where:{id:prodId}})
  })
  .then((products)=>{
    const product=products[0];
    product.cartItem.destroy();
    res.status(200).json({success:true, message: 'Successfully Deleted'})
    //res.redirect('/cart')
  })
  .catch(err=>{
    res.status(500).json({success:false,message:'error occured while deleting'})
  })
}


/*exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(product => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch(err => console.log(err));
    })
    .then(result => {
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
}
*/
exports.postOrder=(req, res, next) =>{
  let total_amount=0;
  let orderId;
  let fetchedOrder;
  req.user.createOrder()
  .then(order=>{
      fetchedOrder=order;
      orderId=order.id
      return req.user.getCart()
              .then(cart=>{
                return cart.getProducts()
              })
              .then(products=>{
                products.forEach((prod)=>{
                  order.addProduct(prod,{through:{quantity:prod.cartItem.quantity}});
                  total_amount+=(prod.cartItem.quantity*prod.price)
                  prod.cartItem.destroy();

                })
              })
  })
  .then(()=>{
    fetchedOrder.set({amount:total_amount})
    fetchedOrder.save()
    res.status(200).json({success:true, message: `Order successfully placed. Your Order Id:${orderId}`})
  })
  .catch((err)=>{
    console.log(err)
  })
}


/*exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({include: ['products']})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};*/

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include:[`products`]})
  .then((orders)=>{
    if(!orders)
    res.json({success:false,message:'No order Found'})
    else
    {
      res.status(200).json({success:true,orders:orders})
    }
  })
  .catch(err=>{
    console.log(err)
  })
};


exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};





