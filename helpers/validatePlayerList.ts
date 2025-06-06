export function validatePlayerList(unvalidatedList: any[]) {
  return unvalidatedList.every((item) => {
    return item.identifier !== undefined && item.dockerId !== undefined;
  });
}
