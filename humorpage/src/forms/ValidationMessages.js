export const GetMessages = (elem) => {
	const messages = [];
	if(elem.validity.valueMissing){
		messages.push("내용을 입력해주세요");
	}
	if(elem.validity.typeMismatch){
		messages.push(`${elem.type} 형식에 맞춰주세요.`);
	}
	if(elem.validity.patternMismatch){
		messages.push(`내용을 확인해주세요`);
	}
	return messages;
}