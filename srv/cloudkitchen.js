const cds = require('@sap/cds');
 
module.exports = cds.service.impl(async function(){
    const productapi = await cds.connect.to('API_PRODUCT_SRV');
 
    this.on('READ','Products', async req => {
        req.query.SELECT.columns=[{ref:['Product']},{ref:['ProductType']},{ref:['ProductGroup']},{ref:['BaseUnit']},{ref:['to_Description'],expand:['*']}]
       let res = await productapi.run(req.query)
       res.forEach((element)=>{
        element.to_Description.forEach((item)=>{
            if(item.Language='EN')
                element.ProductDescription=item.ProductDescription;
        })
       })
       return res
    })
   
})