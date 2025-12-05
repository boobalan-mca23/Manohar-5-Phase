;
 
// exports.getWeightController = async (req, res) => {
//     try {
//         const data = await getWeight();  
//         console.log('Serial weight:', data);
//         res.status(200).json({ 'weightdata':Number(data) });
//     } catch (err) {
//         console.error('Error fetching weight:', err);
//         res.status(500).json({ error: 'Failed to read weight', details: err.message });
//     }
// };
const { getWeight } = require('../serialPort/serialPort');

exports.getWeightController = async (req, res) => {
    try {
        const data = await getWeight();
        console.log('Serial weight:', data);

        // Convert to a number and ensure 3 decimal places
        const formattedWeight = Number(data).toFixed(3);

        res.status(200).json({ weightdata: formattedWeight });
    } catch (err) {
        console.error('Error fetching weight:', err.message);
        res.status(500).json({ error: 'Failed to read weight', details: err.message });
    }
};
