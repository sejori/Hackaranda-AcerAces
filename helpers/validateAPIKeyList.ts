export function validateAPIKeyList(unvalidatedList: any[]) {
  return unvalidatedList.every((item) => {
    item.apiKey !== undefined && item.name !== undefined;
  });
}
