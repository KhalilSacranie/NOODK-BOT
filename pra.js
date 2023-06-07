const axios = require('axios');

const pra = async () => {
	const input = `Sacrilege Biosecurity Responders SKIN	1
	Sunesis Versus Redforce SKIN	1
	Taranis Biosecurity Responders SKIN	1
	Vexor Navy Issue Versus Blueforce SKIN	1
	Vigil Biosecurity Responders SKIN	1
	Caldari Shuttle Biosecurity Responders SKIN`;

	let items = input.split('\n');

	for (let i = 0; i < items.length; i++) {
		items[i] = items[i].replace(/[^a-zA-Z ]/g, '');

		try {
			const url = 'https://evepraisal.com/appraisal/structured.json';
			const data = {
				market_name: 'jita',
				items: [
					{
						name: items[i],
					},
				],
			};
			const headers = {
				'User-Agent': 'NOOKD-BOT',
				'Content-Type': 'application/json',
			};

			const response = await axios.post(url, data, { headers });
			let app = response.data.appraisal.items[0].name;

			const lastIndex = app.lastIndexOf(' ');
			app = app.substring(0, lastIndex);

			if (app.includes('Issue')) {
				let [ship, skin] = app.split('Issue');
				ship += 'Issue';
				console.log(ship, skin);
			} else if (app.includes('Shuttle')) {
				let [ship, skin] = app.split('Shuttle');
				ship += 'Shuttle';
				console.log(ship, skin);
			}
		} catch (err) {
			console.error(err);
		}
	}
};

pra();
