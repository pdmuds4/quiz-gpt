const render = (template_element) => {
    const root = document.getElementById('root');
    const clone = template_element.content.cloneNode(true);
    root.innerHTML = '';
    root.appendChild(clone);
}


const callChatGpt = async (loading_status) => {
    loading_status.hidden = false;
    const form_value = document.querySelector('#start-form-age').value;
    let error_ct = 0;

    while (true) {
        if (error_ct == 5) {
            loading_status.hidden = true;
            alert('APIとの接続に失敗しました。時間をおいて再度お試しください。');
            break;
        }

        try {
            let response = await fetch('https://ts-tiny-api.vercel.app/api/chatgpt/get_quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({age: Number(form_value)})
            });
            let data = await response.json();

            if (data.error) {
                loading_status.hidden = true;
                alert('APIとの接続に失敗しました。時間をおいて再度お試しください。');
                break;
            } else {
                loading_status.hidden = true;
                quizNodeTemplates = data.map((quiz, index) => createQuizTemplate(quiz, index));
                render(quizNodeTemplates[0]);
                break;
            }
        } catch (error) {
            console.log(error);
            error_ct++
            continue;
        }
    };

    // let data = sample_data;
    // setTimeout(() => {
    //     console.log(data);
    //     loading_status.hidden = true;
    //     quizNodeTemplates = data.map((quiz, index) => createQuizTemplate(quiz, index));
    //     render(quizNodeTemplates[0]);
    // }, 1000)
}


const createQuizTemplate = (quiz_obj, index) => {
    let quizTemplate = document.querySelector('#quiz').cloneNode(true);
    quizTemplate.content.querySelector('.number').textContent = `問${index + 1}.`;
    quizTemplate.content.querySelector('.question').textContent = quiz_obj.question;

    let choices = quiz_obj.choices;
    for (let i=0; i<3; i++) {
        let quizbtn = quizTemplate.content.querySelector(`#c${i}`)
        quizbtn.textContent = choices[i];
        quizbtn.setAttribute('onclick', `checkAnswer(${index}, ${quiz_obj.answer}, ${i})`);
    }

    return quizTemplate;
}


const checkAnswer = (quiz_num, answer, selected) => {
    if (answer == selected) {
        audio.src = "./audio/correct.mp3"
        audio.play();

        great_cnt++;
    } else {
        audio.src = "./audio/wrong.mp3"
        audio.play();

    }

    if (quiz_num == 9) {
        let resultTemplate = document.querySelector('#result');
        resultTemplate.content.querySelector('.score').textContent = `${great_cnt}/10`;
        render(resultTemplate);
    } else {
        render(quizNodeTemplates[quiz_num + 1]);
    }
}