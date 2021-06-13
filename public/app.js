document.querySelectorAll(".wrap").forEach(item=>{

	$(item.children[0]).on("mouseover",(e)=>{
	console.log($(item.children[1]));
	$(item.children[1]).css({
		"visibility":"visible",
		"height":"100px"
	})

})
});

document.querySelectorAll(".wrap").forEach(item=>{
	$(item.children[0]).on("mouseleave",(e)=>{
	console.log($(item.children[1]));
	$(item.children[1]).css({
		"visibility":"hidden",
		"height":"0px"
	})

})
});
