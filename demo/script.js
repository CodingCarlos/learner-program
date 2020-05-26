/*	ToDo's:
 *	- Add some MD -> HTML parsing to make the example more clear.
 *	- Add quiz feature.
 *	- Redo this code in a propper way. This sucks.
 */

// Configs
const REPOSITORY = 'CodingCarlos/learner-program';
const APP = document.getElementById('app');
const LESSON = document.getElementById('lesson');

// Lesson props
const TYPE_MARKER = '>type:';


// Flow Control
let currentLesson = 0;


// Execution
getInfo().then(info => {
	printInfo(info, APP);
});

getLessons().then(lessons => {
	printLessons(lessons, APP);
});

document.getElementById('js-prev').addEventListener('click', prevLesson);
document.getElementById('js-next').addEventListener('click', nextLesson);


// Course info
async function getInfo() {
	let response = await fetch(`https://raw.githubusercontent.com/${REPOSITORY}/master/info.md`)
	if (response.ok) {
	  let info = await response.text();

	  return parseInfo(info);
	}
	
	alert("HTTP-Error: " + response.status);
	return null;
}

function parseInfo(info) {
	let arrayInfo = info.split('\n');
	let title = '';
	for (var i = 0; i < arrayInfo.length; i++) {
		let item = arrayInfo[i]
		if (item.indexOf('#') > -1) {
			title = item;
			break;
		}
	}

	const newInfo = {
		title: title.replace('#', ''),
		description: info.replace(title, '').trim(),
	};

	return newInfo;
}

function printInfo(info, elem) {
	// Prepare title
	let title = document.createElement('h1');
	title.innerHTML = info.title;

	// Prepare description
	let description = document.createElement('p');
	description.innerHTML = info.description;

	// Add the elements
	elem.appendChild(title);
	elem.appendChild(description);
}
// END course info


// Course lessons
async function getLessons() {
	let response = await fetch(`https://api.github.com/repos/${REPOSITORY}/contents/lessons`)
	if (response.ok) {
	  let lessons = await response.json();

	  return parseLessonInfo(lessons);
	}
	
	alert("HTTP-Error: " + response.status);
	return null;
}

function parseLessonInfo(lessons) {
	// ToDo @CodingCarlos: Order lessons by "order" param.
	return lessons.map(item => {
		const FILE_EXT = '.md';
		let order = item.name.split('-')[0];
		let name = item.name.replace(order + '-', '');
		name = name.substring(0, (name.length - FILE_EXT.length));

		const lesson = {
			order: Number(order),
			name: name,
			uri: item.download_url,
		};

		return lesson;
	});
}

function printLessons(lessons, elem) {
	let ul = document.createElement('ul');
	ul.className = 'main-menu'

	lessons.forEach(item => {
		let li = document.createElement('li');
		li.innerHTML = `${item.order} - ${item.name}`;
		li.setAttribute('data-uri', item.uri);
		li.setAttribute('data-order', item.order);
		li.addEventListener('click', loadLesson);

		ul.appendChild(li);
	});

	elem.appendChild(ul);
}
// END Course lessons


// Course Lesson
async function loadLesson(e) {
	e.preventDefault();

	const uri = e.target.getAttribute('data-uri');
	const order = e.target.getAttribute('data-order');

	let response = await fetch(uri)
	if (response.ok) {
	  let lesson = await response.text();

	  // Update current lesson
	  currentLesson = order

	  return parseLesson(lesson);
	}
	
	alert("HTTP-Error: " + response.status);
}

function parseLesson(lesson) {
	// Get lesson type
	let lines = lesson.split('\n');
	let type = '';

	for (var i = 0; i < lines.length; i++) {
		let l = lines[i];

		if (l.indexOf(TYPE_MARKER) > -1) {
			type = l.replace(TYPE_MARKER, '');
		}
	}

	// Lesson Content
	let lessonContent = lesson.replace(TYPE_MARKER + type, '').trim();

	// Print lesson
	switch (type) {
		case 'cards':
			printLessonCards(lessonContent, LESSON);
			break;

		case 'text':
		default:
			printLessonText(lessonContent, LESSON);
	}
}

function clearLesson() {
	LESSON.innerHTML = '';
}

function printLessonText(lesson, elem) {
	clearLesson();

	let div = document.createElement('pre');
	div.innerHTML = lesson;

	elem.appendChild(div);
}

function printLessonCards(lesson, elem) {
	let cards = lesson.split('# ').map(cardItem => {
		const title = cardItem.split('\n')[0];
		const card = {
			title: title,
			content: cardItem.replace(title, '').trim(),
		};

		return card;
	}).filter(item => item.title && item.content);

	clearLesson();

	const container = document.createElement('div');
	cards.forEach(card => {
		const div = document.createElement('div');
		div.className = 'card';

		const title = document.createElement('h1');
		title.innerHTML = card.title;
		div.appendChild(title);

		const content = document.createElement('div');
		content.innerHTML = card.content;
		div.appendChild(content);

		container.appendChild(div);
	});

	elem.appendChild(container);
}
// END Course Lesson


// Next / Prev
function nextLesson() {
	console.log(currentLesson);
	let lessonItems = document.querySelectorAll('.main-menu li');
	currentLesson++;
	console.log(currentLesson);
	if (currentLesson > lessonItems.length) {
		currentLesson = 0;
		clearLesson();
		alert("Congrats! You've finished the course!");
		return true;
	}
	
	lessonItems[currentLesson - 1].click();
}

function prevLesson() {
	console.log(currentLesson);
	let lessonItems = document.querySelectorAll('.main-menu li');
	currentLesson--;
	console.log(currentLesson);
	if (currentLesson <= 0) {
		currentLesson = 0;
		clearLesson();
		return true;
	}
	
	lessonItems[currentLesson - 1].click();
}
// END Next / Prev