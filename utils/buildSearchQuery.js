module.exports = function buildSearchQuery(query) {
	const devices = ["phone", "tablet", "desktop", "desktop-wide"];
	const { device, description } = query;
	const search = {
		...(devices.includes(device) && { device }),
		...(description && {
			description: {
				$regex: new RegExp(`${description}`, "i")
			}
		}
		)
	}
	return search;
}