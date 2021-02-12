var faker = require("faker");
var contexts = [];
faker.seed(100);


var comments = [];
var comments_total = 0
for(let i=1; i<=103; i++){
	var comment_cnt = Number(faker.random.number(10))
	var comment_ids = []
	for(j=0;j<comment_cnt;j++){
		comment_ids.push(comment_cnt+j)
		comments.push({
			id:comment_cnt+j,
			context_id:i,
			context:faker.lorem.sentence(5),
			author:faker.lorem.word(10),
			date:faker.date.past(),
		})
	}
	comments_total+=comment_cnt
	contexts.push({
		id:i,
		author:faker.lorem.word(10),
		title:faker.lorem.sentence(10),
		context:faker.lorem.paragraph(10),
		likes:Number(faker.random.number(100)),
		join:Number(faker.random.number(1000)),
		date:faker.date.past(),
		comment_cnt:comment_cnt,
		comment_ids:comment_ids
	})
}


module.exports = function(){
	return{
		contexts:contexts,
		comments:comments,
	}
}