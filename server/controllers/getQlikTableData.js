// const dialogFunc = require ('./dialog-flow')

const enigma = require('enigma.js');
const WebSocket = require('ws');

const schema = require('enigma.js/schemas/12.67.2.json');
// const server_url= 'ws://localhost:4848/app/'
const server_url= 'https://accqsdemo.accenture.com/'
const appID = 'e8836849-a105-4e4c-b93f-469df9a9976c';


const config = {
	schema,
	url: server_url + appID,
	createSocket: url => new WebSocket(url)
};
let qObject, qLayout;

function mapTitles(layout) {
	if (layout &&
		layout.qHyperCube &&
		layout.qHyperCube.qDimensionInfo &&
		Array.isArray(layout.qHyperCube.qDimensionInfo) &&
		layout.qHyperCube.qMeasureInfo &&
		Array.isArray(layout.qHyperCube.qMeasureInfo) &&
		layout.qHyperCube.qColumnOrder &&
		Array.isArray(layout.qHyperCube.qColumnOrder)
		) {
			const columns = layout.qHyperCube.qDimensionInfo.concat(layout.qHyperCube.qMeasureInfo);
			const columnTitles = columns.map((item) => item.qFallbackTitle);
			const orderedTitles = layout.qHyperCube.qColumnOrder.map((index) => columnTitles[index]);
			return orderedTitles;
		}
}

function mapData(titles, data) {
	if (data && data[0] &&
		data[0].qMatrix &&
		Array.isArray(data[0].qMatrix)
		) {
			const result = data[0].qMatrix.map((item) => {
				let obj = {};
				item.forEach((item, index) => {
					let value = null;
					if (item.qNum && item.qNum !== 'NaN') {
						value = item.qNum;
					} else {
						value = item.qText;
					}
					obj[titles[index]] = value;
				});
				return obj;
			});
			return result;
		}
}

module.exports = {
    getTableData: (req, res, next) => {
        const object_id = 'fmTygX';
        const qSession=enigma.create(config);
            qSession.open()
                .then((qlikObject) => {

                    return qlikObject.openDoc(appID);
                })
                .then((app) => {

                    return app.getObject(object_id)
                })
                .then((result) => {

                    qObject = result;
                    return qObject.getLayout();
                })
                .then((layout) => {

                    qLayout = layout;
                    return qObject.getHyperCubeData({
                            "qPath": "/qHyperCubeDef",
                            "qPages": [
                                {
                                    "qLeft": 0,
                                    "qTop": 0,
                                    "qWidth": 20,
                                    "qHeight": 30
                                }
                            ]
                    })
            })
            .then((qProp) => {
                const titles = mapTitles(qLayout);
                const result = mapData(titles, qProp);

                res.json(result);

            })
            .catch((err)=>{
                console.log(err);
                res.json(err)
            })
    },
    getTableData2: (req, res, next) => {
        const object_id = 'fmTygX';
        const qSession=enigma.create(config);
            qSession.open()
                .then((qlikObject) => {

                    return qlikObject.openDoc(appID);
                })
                .then((app) => {

                    return app.getObject(object_id)
                })
                .then((result) => {

                    qObject = result;
                    return qObject.getLayout();
                })
                .then((layout) => {

                    qLayout = layout;
                    return qObject.getHyperCubeData({
                            "qPath": "/qHyperCubeDef",
                            "qPages": [
                                {
                                    "qLeft": 2,
                                    "qTop": 0,
                                    "qWidth": 20,
                                    "qHeight": 30
                                }
                            ]
                    })
            })
            .then((qProp) => {
                const titles = mapTitles(qLayout);
                const result = mapData(titles, qProp);

                res.json(result);

            })
            .catch((err)=>{
                console.log(err);
                res.json(err)
            })
    },
}