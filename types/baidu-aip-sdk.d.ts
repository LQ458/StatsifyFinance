declare module "baidu-aip-sdk" {
  export class ocr {
    constructor(appId: string, apiKey: string, secretKey: string);
    generalBasic(image: string): Promise<{
      words_result: Array<{
        words: string;
      }>;
      words_result_num: number;
      log_id: number;
    }>;
  }
}
