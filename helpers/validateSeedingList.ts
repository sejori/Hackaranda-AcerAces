export function validateSeedingList(unvalidatedList: any[]) {
	return unvalidatedList.every(item => {
		return item.identifier !== undefined && item.rank !== undefined;
	});
}
