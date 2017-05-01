var db = require('../config/dbConfig').dbClass

module.exports.insert = function(req,res){
    let newclass = {
        classname: req.body.classname,
        description: req.body.description,
    };
    db.insert(newclass, function(err, newClass) {
        if (err){ 
            console.log(err);
            res.status(500).send('Database controller errors')
        } else {
            console.log(newClass);
            res.json({status:"success"});    
        }
    });

}

module.exports.getAll = function(req,res){
    db.find({}).exec((err,classes)=>{
        if (err) return res.send(err);
        return res.json({classes:classes,info:req.decoded});
    });
}
module.exports.getClassById = function (req,res){
    var classId = req.params.id;
    db.findOne({
        _id:classId
    }, { classname:1, description:1, _id:0 }, (err,class1)=>{
        if (err){
            console.log(err);
            return res.status(500).send('Database controller errors');
        }
        return res.json(class1);
    })
}

module.exports.dropDB = function(req,res){
    db.remove({},{ multi:true },(err,num)=>{
        if (err) res.status(500).send(err);
        res.json({removed:num});
    });
}