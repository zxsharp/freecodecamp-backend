const express = require('express')
const router = express.Router()
const {User} = require('../db/models');

router.post('/', async (req, res) => {
    const username = req.body.username;
    if(!username){
        return res.json({
            error: "no username"
        })
    }

    const response = await User.create({
        username
    })

    // Convert to plain object
    const userObj = response.toObject();

    const {__v, count, log, ...cleanUserObj} = userObj;
    return res.json(cleanUserObj);
})


router.get('/', async (req, res) => {
    let response = await User.find();

    response = response.map(user => user.toObject());
    
    response = response.map(user => {
        const {__v, log, ...cleanedUser } = user;
        return cleanedUser;
    });

    return res.send(response);
})


router.post('/:_id/exercises', async (req, res) => {
    const description = req.body.description;
    let duration = req.body.duration;
    let date = req.body.date;
    const id = req.params._id;

    if(!date){
        date = new Date().toDateString();
    } else {
        const parsedDate = new Date(date);
        
        if(isNaN(parsedDate.getTime())){
            return res.json({
            error: "invalid date format"
            })
        }
        date = parsedDate.toDateString();
    }

    if(!duration || !description || !id){
        return res.json({
            error: "invalid inputs"
        })
    }
    duration = parseInt(duration);

    let response;
    try {
        response = await User.findByIdAndUpdate(id, {
            $inc: {count: 1},
            $push: {
                log: {
                    description,
                    duration,
                    date
                }
            }
        }, {new: true})
    }
    catch(err){
        return res.json({error: "server error"})
    }

    if(!response){
        return res.json({error: "can't find user"})
    }

    // Convert to plain object
    response = response.toObject();

    response.description = description;
    response.duration = duration;
    response.date = date;
    const {__v, count, log, ...cleanResponse} = response

    return res.json(cleanResponse)
    
})


router.get('/:_id/logs', async (req, res) => {
    const id = req.params._id;

    let response;
    try{
        response = await User.findById(id).lean();
    }
    catch(err){
        return res.json({error: "server error"})
    }

    if(!response){
        return res.json({error: "can't find user"})
    }

    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit;

    let filteredLog = response.log;
    if (from || to) {
        filteredLog = filteredLog.filter(exercise => {
            const exerciseDate = new Date(exercise.date);
            const fromDate = from ? new Date(from) : null;
            const toDate = to ? new Date(to) : null;

            if (fromDate && exerciseDate < fromDate) return false;
            if (toDate && exerciseDate > toDate) return false;
            return true;
        });
    }
    if (limit) {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum) && limitNum > 0) {
            filteredLog = filteredLog.splice(0, limitNum);
        }
    }
    response.log = filteredLog;

    const {__v, ...cleanResponse} = response;

    return res.json(cleanResponse);
})


module.exports = router;
