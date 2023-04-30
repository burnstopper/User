import React from "react"
import "./SignInForm.css"
import { Button } from "react-bootstrap"
import "bootstrap/dist/js/bootstrap.js"
import axios from "axios"
//import CookieLib from "../../cookielib-main/index.js"
import CookieLib from "../../cookielib/index.js"

let mode = 'signup'
let contact_type = 'email'
let status = 'await' // await_login/await_signup/success/signup_taken/logged_in/login_nonexistent/error


function switchToEmail() { // ADD A CONTACT_FLAG
    let item = document.getElementById('tg');
    item.style.display='none';
    item = document.getElementById('email');
    item.style.display='flex';
    contact_type = 'email'
}

function switchToTelegram() {
    let item = document.getElementById('email');
    item.style.display='none';
    item = document.getElementById('tg');
    item.style.display='flex';
    contact_type = 'tg'
}

function switchMode() { // ADD A MODE_FLAG
    if (mode === 'signup') {  // check by mode
        /*let content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Регистрация';
        content = document.getElementById('text_mode');
        content.innerHTML = 'Авторизация';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Авторизоваться';*/
        mode = 'login'
        window.location.pathname = '/login'
    } else {
        /*let content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Авторизация';
        content = document.getElementById('text_mode');
        content.innerHTML = 'Регистрация';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Зарегистрироваться';*/
        mode = 'signup'
        window.location.pathname = '/signup'
    }
}

async function handleSubmitClick() { // ADD A MODE_FLAG
    let content = document.getElementById('text_mode');
    content.innerHTML = 'На вашу почту отправлено письмо подтверждения.'; // а если не почта а тг???
    content = document.getElementById('email');
    content.style.display='none';
    content = document.getElementById('tg');
    content.style.display='none';
    content = document.getElementById('button_switch_mode');
    content.style.display='none';
    content = document.getElementById('button_return');
    //let input;
    let data;
    if (contact_type === 'email') {
        content.innerHTML = 'Ввести почту заново'
        // get input data for mail
        /*input = document.getElementById('email_input');
        data = input.value;*/
        data = document.getElementById('email_input').value;
    } else {
        // get input data for tg
        content.innerHTML = 'Ввести юзернейм заново'
        /*input = document.getElementById('tg_input');
        data = input.value;*/
        data = document.getElementById('tg_input').value;
    }
    content.style.display='flex';
    content = document.getElementById('button_submit');
    content.innerHTML = 'Отправить письмо еще раз'
    // send email to given address and receive new token for cookies
    if (mode === 'signup') { // WORKS, USE AS REF FOR LOGIN
        let token = CookieLib.getCookieToken();
        console.log('token: ', token);
        if (token === undefined) {  // if undefined, post request to user to trigger anonymous registration
            //await axios.post('http://127.0.0.1/new-token', {})
            //await axios.post('http://127.0.0.1/new_token', {})
            await axios.post('/new_token', {
            }).then(response => {
                console.log('new_token response: ', response);
                //console.log(response.status);
                token = response.data
                CookieLib.setCookieToken(token)
                console.log('token after new_token: ', CookieLib.getCookieToken());
            }).catch(error => {
                console.log(error.response/*.status*/);
                //console.log(CookieLib.getCookieToken());
            });
        }
        //console.log(CookieLib.getCookieToken());
        //CookieLib.removeCookie();
        //axios.post("http://127.0.0.1/registration", {
        await axios.post("/registration", {
            email_address: data,
        }, {
            params: {
                //user_token: ',vnbsdkjbfojvs;mb;fl',
                user_token: token,
            },
        })
            .then((response) => {
                console.log('registration response: ', response);
            });
    } else {
        //axios.post("http://127.0.0.1/login", { // no params for login?
        //await axios.post("/login", {
        await axios.post("/authorization", {
                email_address: data,
            })
            .then((response) => {
                console.log('login response: ', response);
            });
    }
}

async function afterSubmit() {
    let data;
    if (contact_type === 'email') {
        data = document.getElementById('email_input').value;
    } else {
        data = document.getElementById('tg_input').value;
    }
    //requests
    if (mode === 'signup') {
        let token = CookieLib.getCookieToken();
        console.log('token: ', token);
        if (token === undefined) {  // if undefined, post request to user to trigger anonymous registration
            //await axios.post('http://127.0.0.1/new-token', {})
            //await axios.post('http://127.0.0.1/new_token', {})
            await axios.post('/new_token', {
            }).then(response => {
                console.log('new_token response: ', response);
                //console.log(response.status);
                token = response.data // ?????????
                CookieLib.setCookieToken(token)
                console.log('token after new_token: ', CookieLib.getCookieToken());
            }).catch(error => {
                console.log(error.response/*.status*/);
                //console.log(CookieLib.getCookieToken());
                // GENERAL_ERROR - Проблемы на сервере, пожалуйста, попробуйте позже
                status = 'error';
                console.log('status: ', status)
            });
        }
        //console.log(CookieLib.getCookieToken());
        //CookieLib.removeCookie();
        //axios.post("http://127.0.0.1/registration", {
        await axios.post("/registration", {
            email_address: data,
        }, {
            params: {
                //user_token: ',vnbsdkjbfojvs;mb;fl',
                user_token: token,
            },
        }).then(response => {
            console.log('registration response: ', response);
            //if (response.data.detail === 'You are already logged in with this email') {
            if (response.data === null) {  // response.data.detail raises error when data = null
                status = 'success';
                console.log('status: ', status);
            } else {
                //if (response.data.detail === 'You are already logged in with this email') status = logged_in
                status = 'logged_in';
                console.log('status: ', status)
            }
        }).catch(error => {   // triggers when email is not valid (error 422!!!)
            console.log(error);
            console.log(error.response/*.status*/);
            //console.log(CookieLib.getCookieToken());
            // error 409 - signup_taken
            console.log(error.response.status);
            if (error.response.status === 422) {
                status = 'incorrect_format'; /// некорректный формат !!!!!!!
            } else if (error.response.status === 409) {
                status = 'signup_taken';
            } else {
                status = 'error';
            }
            //status = 'signup_taken';
            console.log('status: ', status)
        });
    } else {
        //axios.post("http://127.0.0.1/login", { // no params for login?
        //await axios.post("/login", {
        await axios.post("/authorization", {
            email_address: data,
        }).then(response => {
            console.log('login response: ', response);
            if (response.data === null) {  // response.data.detail raises error when data = null
                status = 'success';
                console.log('status: ', status);
            } else {
                //if (response.data.detail === 'You are already logged in with this email') status = logged_in
                status = 'logged_in';
                console.log('status: ', status)
            }
        }).catch(error => {
            console.log(error);
            console.log(error.response/*.status*/);
            //console.log(CookieLib.getCookieToken());
            // error 409 - signup_taken ???
            console.log(error.response.status);
            if (error.response.status === 422) {
                status = 'incorrect_format'; /// некорректный формат !!!!
            } else if (error.response.status === 404) {
                status = 'login_nonexistent';
            } else {
                status = 'error';
            }
            //status = 'login_nonexistent';
            console.log('status: ', status)
        });
    }
    let content = document.getElementById('email'); // form for email, removed anyway
    content.style.display='none';

    content = document.getElementById('tg'); // form for tg, removed anyway
    content.style.display='none';

    if (status === 'logged_in') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Вы уже авторизованы.<br/>Тесты доступны на верхней панели.<br/>Чтобы принять участие в исследовании, пожалуйста, заполните анкету.';
        // кнопка для анкеты?

        content = document.getElementById('button_submit');
        content.style.display='none';
        content = document.getElementById('button_switch_mode');
        content.style.display='none';

    } else if (status === 'signup_taken') {  // triggers when email is not valid (error 422!!!)
        content = document.getElementById('text_mode');
        content.innerHTML = 'Введенная вами почта уже занята.'; // а если не почта а тг???
        // 2 кнопки - ввести другую почту(рега!!!) И Авторизоваться

        content = document.getElementById('button_submit');
        content.style.display='none';

        content = document.getElementById('button_return');
        if (contact_type === 'email') {
            content.innerHTML = 'Ввести почту заново'
            //data = document.getElementById('email_input').value;
        } else {
            // get input data for tg
            content.innerHTML = 'Ввести юзернейм заново'
            //data = document.getElementById('tg_input').value;
        }
        content.style.display='flex';

    } else if (status === 'login_nonexistent') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Данная почта не зарегистрирована.'; // а если не почта а тг???

        content = document.getElementById('button_return');
        if (contact_type === 'email') {
            content.innerHTML = 'Ввести почту заново'
            //data = document.getElementById('email_input').value;
        } else {
            // get input data for tg
            content.innerHTML = 'Ввести юзернейм заново'
            //data = document.getElementById('tg_input').value;
        }
        content.style.display='flex';

        content = document.getElementById('button_submit');
        content.style.display='none';

    } else if (status === 'success') { // режим важен при return click
        content = document.getElementById('text_mode');
        content.innerHTML = 'На вашу почту отправлено письмо подтверждения.';
        content = document.getElementById('button_switch_mode');
        content.style.display='none';
        content = document.getElementById('button_return');
        //let data;  // DATA
        if (contact_type === 'email') {
            content.innerHTML = 'Ввести почту заново'
            //data = document.getElementById('email_input').value;
        } else {
            // get input data for tg
            content.innerHTML = 'Ввести юзернейм заново'
            //data = document.getElementById('tg_input').value;
        }
        content.style.display='flex';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Отправить письмо еще раз'
    } else if (status === 'incorrect_format') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Некорректный формат email. Пожалуйста, введите почту заново.'; // а если не почта а тг???

        content = document.getElementById('button_return');
        if (contact_type === 'email') {
            content.innerHTML = 'Ввести почту заново'
            //data = document.getElementById('email_input').value;
        } else {
            // get input data for tg
            content.innerHTML = 'Ввести юзернейм заново'
            //data = document.getElementById('tg_input').value;
        }
        content.style.display='flex';

        content = document.getElementById('button_submit');
        content.style.display='none';
    } else {  // if error
        content = document.getElementById('text_mode');
        content.innerHTML = 'Произошла ошибка. Пожалуйста, попробуйте позднее.';
        content = document.getElementById('button_switch_mode');
        content.style.display='none';
        content = document.getElementById('button_return');
        content.style.display='none';
    }
}

function handleReturnClick() { // BUTTON_RETURN
    let content = document.getElementById('button_return');
    content.style.display='none';
    if (mode === 'signup') {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Регистрация';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Зарегистрироваться'
        content.style.display='flex';
        content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Авторизация'
    } else {
        content = document.getElementById('text_mode');
        content.innerHTML = 'Авторизация';
        content = document.getElementById('button_submit');
        content.innerHTML = 'Авторизоваться'
        content.style.display='flex';
        content = document.getElementById('button_switch_mode');
        content.innerHTML = 'Регистрация'
    }
    //content.style.display='flex';

    if (contact_type === 'email') {
        content = document.getElementById('email');
        content.style.display='flex';
    } else {
        content = document.getElementById('tg');
        content.style.display='flex';
    }
    content = document.getElementById('button_switch_mode');
    content.style.display='flex';
    /*content = document.getElementById('button_return');
    content.style.display='none';*/

}

const SignInForm = ({ handleClick }) => {
    let queryString = window.location.pathname;
    if (queryString === '/signup') {
        mode = 'signup';
        return (
            <div className="content">
                <div className="frame">
                    <div className="mode_toggle">
                        <Button variant="outline-danger" id="button_switch_mode" onClick={switchMode}>Авторизация</Button>
                    </div>
                    <div className="text_general" id="text_mode">
                        Регистрация
                    </div>
                    <div className="input-group mb-3" id="email">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">Выберите контакт
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Email</button></li>
                            <li><button className="dropdown-item" onClick={switchToTelegram}>Telegram</button></li>
                        </ul>
                        <input type="text" className="form-control" placeholder="Email" id="email_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="input-group mb-3" id="tg">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">Выберите контакт
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Telegram</button></li>
                            <li><button className="dropdown-item" onClick={switchToEmail}>Email</button></li>
                        </ul>
                        <span className="input-group-text">@</span>
                        <input type="text" className="form-control" placeholder="Username" id="tg_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="submit">
                        <Button variant="success" id="button_submit" onClick={afterSubmit}>
                            Зарегистрироваться
                        </Button>
                    </div>
                    <Button variant="success" id="button_return" onClick={handleReturnClick}>
                        Ввести почту заново
                    </Button>
                </div>
            </div>
        )
    } else {
        mode = 'login';
        return (
            <div className="content">
                <div className="frame">
                    <div className="mode_toggle">
                        <Button variant="outline-danger" id="button_switch_mode" onClick={switchMode}>Регистрация</Button>
                    </div>
                    <div className="text_general" id="text_mode">
                        Авторизация
                    </div>
                    <div className="input-group mb-3" id="email">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">Выберите контакт
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Email</button></li>
                            <li><button className="dropdown-item" onClick={switchToTelegram}>Telegram</button></li>
                        </ul>
                        <input type="text" className="form-control" placeholder="Email" id="email_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="input-group mb-3" id="tg">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">Выберите контакт
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Telegram</button></li>
                            <li><button className="dropdown-item" onClick={switchToEmail}>Email</button></li>
                        </ul>
                        <span className="input-group-text">@</span>
                        <input type="text" className="form-control" placeholder="Username" id="tg_input" aria-label="Text input with dropdown button"/>
                    </div>
                    <div className="submit">
                        <Button variant="success" id="button_submit" onClick={afterSubmit}>
                            Авторизоваться
                        </Button>
                    </div>
                    <Button variant="success" id="button_return" onClick={handleReturnClick}>
                        Ввести почту заново
                    </Button>
                </div>
            </div>
        )
    }
}

export default SignInForm
