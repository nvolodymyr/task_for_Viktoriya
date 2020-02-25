const express = require('express');
const router = express.Router();
const FanShema = require('../myShema');



router.get('/', async(req, res) => {
    try {
        const fansData = await FanShema.find()
        res.json(fansData)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

router.post('/', async(req, res) => {
    const fan = new FanShema({
        id: req.body.id,
        text: req.body.text,
    })
    try {
        const newFan = await fan.save()
        res.status(201).json(newFan)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
});
module.exports = router;