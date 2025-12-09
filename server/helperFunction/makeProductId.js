const {PrismaClient}=require('@prisma/client')
const prisma=new PrismaClient()


exports.makeProductId = async (goldSmithCode, itemCode, product) => {

    let gross = product.grossWeight.toString();

    // If number contains a decimal, remove trailing zeros and decimal if needed
    if (gross.includes(".")) {
        gross = gross.replace(/\.?0+$/, ""); // remove decimal trailing zeros
    }

    // Now pad the cleaned weight to length 6
    let paddedWeight = gross.padStart(6, "0");

    // Final Product ID
    let id = "PL" + product.id + goldSmithCode + itemCode + paddedWeight;

    const updateProduct = await prisma.product_info.update({
        where: { id: product.id },
        data: { product_number: id },
        include: { product_images: true }
    });

    return updateProduct;
};
