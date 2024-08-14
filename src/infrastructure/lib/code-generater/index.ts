import { ProductCodeType, ProductType } from "src/common/database/Enums";
//code generater for product fields: bar_code and plu
export function generateProductCode(
  code_type: ProductCodeType,
  product_ype?: ProductType.PCS,
): number {
  let code = 0;

  switch (code_type) {
    case ProductCodeType.PLU:
      code = 100 + Math.floor(Math.random() * 900);
      break;
    case ProductCodeType.BAR_CODE:
      code = 10000000000 + Math.floor(Math.random() * 90000000000);

      //bar_code should start with "22" both  product types "kg" and "pcs"
      code = Number("22" + code.toString());
      break;
  }
  return code;
}
