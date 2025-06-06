export function validateSeedingList(unvalidatedList: any[]) {
  return unvalidatedList.every((item) => {
    item.apiKey !== undefined && item.rank !== undefined;
  });
}
