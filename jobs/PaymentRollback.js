/**
 * Created by vibhor on 8/5/14.
 */
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.minute = 1;
rule.hour = 0;
/*{hour: 12, minute: 15, dayOfWeek: 4}*/
var job = schedule.scheduleJob(rule, function () {

    //TODO fix this, rewrite whole with consideration of new issue in github and new DOMAIN

    console.log('The answer to life, the universe, and everything!');
    var currentDate = new Date();
    var transactionDate = new Date();
    transactionDate.setDate(currentDate.getDate() - 5);
    //var date = new Date(1399531939936);
    var transactionTimeStamp = +transactionDate;
    log.info(+transactionDate);
    log.trace(+transactionDate - 1397389920429);
    Work.find({'copiesDetail.locked': true}, {}, function (err, works) {
        log.warn(works);
        if (works) {
            log.warn(works);
            works.forEach(function (work) {
                console.log(work);
                var pullObjects = [];
                var editionCount = 0;
                work.copiesDetail.forEach(function (copies) {
                    log.trace(copies);
                    if (copies.ownerId == work.artistUserId && transactionDate >= copies.transferDate) {
                        console.log("artist \n ====================\n");
                        pullObjects.push({'ownerId': work.artistUserId});
                        editionCount++;
                    }
                    else {
                        User.findOne({"_id": copies.ownerId}, {'email.primary': 1}, function (err, user) {
                            console.log(user);
                            if (user) {
                                Work.update({copiesDetail: {$elemMatch: {'ownerId': user._id,
                                        'locked': true,
                                        'transferDate': {$lte: transactionDate}
                                    }}},
                                    {
                                        'copiesDetail.$.buyerEmail': user.email.primary,
                                        'copiesDetail.$.locked': false,
                                        'transferDate': null
                                    })

                            }

                        })
                    }
                });
                var query = {
                    $pull: { 'copiesDetail': {$in: pullObjects}},
                    $inc: {edition: editionCount}
                };
                log.trace(query, '\n', work._id);
                Work.update({_id: work._id}, query, function (err, result, data) {
                    if (result) {
                        console.log(result);
                        console.log(data);
                    }
                });
            })
        }

    });
});
console.log("job started", new Date());