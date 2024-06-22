const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const productapi = await cds.connect.to("API_PRODUCT_SRV");

  this.on("READ", "Products", async (req) => {
    req.query.SELECT.columns = [
      { ref: ["Product"] },
      { ref: ["ProductType"] },
      { ref: ["ProductGroup"] },
      { ref: ["BaseUnit"] },
      { ref: ["to_Description"], expand: ["*"] },
    ];
    let res = await productapi.run(req.query);

    res.forEach((element) => {
      const englishDescription = element.to_Description.find(
        (item) => item.Language === "EN"
      );
      englishDescription &&
        (element.ProductDescription = englishDescription.ProductDescription);
    });
    return res;
  });
  this.before("READ", "ProductLocal", async (req) => {
    const { Products, ProductLocal } = this.entities;
    qry = SELECT.from(Products)
      .columns([
        { ref: ["Product"] },
        { ref: ["ProductType"] },
        { ref: ["ProductGroup"] },
        { ref: ["BaseUnit"] },
        { ref: ["to_Description"], expand: ["*"] },
      ])
      .limit(1000);
    let res = await productapi.run(qry);
    res.forEach((element) => {
      const englishDescription = element.to_Description.find(
        (item) => item.Language === "EN"
      );
      englishDescription &&
        (element.ProductDescription = englishDescription.ProductDescription);

      delete element.to_Description;
    });
    insqry = UPSERT.into(ProductLocal).entries(res);
    await cds.run(insqry);
  });
});
