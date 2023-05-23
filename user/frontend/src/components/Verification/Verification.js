import React, {useState, useEffect} from "react"
import "./Verification.css"
import axios from "axios";
import CookieLib from "../../cookielib/index.js"

let result = 'await'

function redirectLogin() {
    window.location.pathname = "/login"
}

function redirectSignUp() {
    window.location.pathname = "/signup"
}

function redirectQuestionnaire() {
	window.location.replace("http://185.46.11.65:8002/");
}


const getStatus = async() => {
    let request_url = window.location.pathname;
    let request_id_encrypted = request_url.substring(request_url.lastIndexOf('/') + 1);
    if (request_url.includes('signup')) {
        let url = '/registration/verify/' + request_id_encrypted;
        await axios.post(url, {
            request_id_encrypted: request_id_encrypted,
        }).then(response => {
            result = 'signup_success'
            let token = response.data.token;
            CookieLib.setCookieToken(token);
        }).catch(error => {
            result = 'signup_expired'
        });
    } else {
        let url = '/authorization/verify/' + request_id_encrypted;
        await axios.post(url, {
            request_id_encrypted: request_id_encrypted,
        }).then(response => {
            result = 'login_success'
            let token = response.data.token;
            CookieLib.setCookieToken(token)
        })
        .catch(error => {
            result = 'login_expired'
        });
    }
}

const Verification = ({handleClick}) => {
    const [res, setResult] = useState("await");
    useEffect(() => {
        getStatus().then(
            res => setResult(result));
    },[]);
    if (result === 'signup_success') {
        return (
            <div className="content">
                <div className="frame">
                    <div className="text_and_input" style={{justifyContent: 'space-between'}}>
                        <div className="text_general">
                            Email успешно подтвержден! Вы зарегистрированы и авторизованы.<br/>Тесты доступны на верхней
                            панели.<br/>Чтобы принять участие в исследовании, пожалуйста, заполните анкету.
                        </div>
                    </div>
                    <div className="submit">
                        <button className="btn_default" onClick={redirectQuestionnaire} id="button_quiz_verif">
                            Заполнить анкету
                        </button>
                    </div>
                </div>
            </div>
        )
    } else if (result === 'signup_expired') {
        return (
            <div className="content">
                <div className="frame">
                    <div className="text_and_input">
                        <div className="text_general" id="text_mode">
                            Срок действия ссылки истек.<br/> Пожалуйста, зарегистрируйтесь заново.
                        </div>
                    </div>
                    <div className="submit">
                        <button className="btn_default" onClick={redirectSignUp} id="button_repeat">
                            Повторить регистрацию
                        </button>
                    </div>
                </div>
            </div>
        )
    } else if (result === 'login_success') {
        return (
            <div className="content">
                <div className="frame">
                    <div className="text_and_input" style={{justifyContent: 'space-between'}}>
                        <div className="text_general" id="text_mode">
                            Вы авторизованы. Рады снова видеть вас на Burnout tester!<br/>Тесты доступны на верхней
                            панели.<br/>Чтобы принять участие в исследовании, пожалуйста, заполните анкету.
                        </div>
                    </div>
                    <div className="submit">
                        <button className="btn_default" onClick={redirectQuestionnaire} id="button_quiz_verif">
                            Заполнить анкету
                        </button>
                    </div>
                </div>
            </div>
        )
    } else if (result === 'login_expired') {
        return (
            <div className="content">
                <div className="frame">
                    <div className="text_and_input">
                        <div className="text_general" id="text_mode">
                            Срок действия ссылки истек.<br/> Пожалуйста, авторизуйтесь заново.
                        </div>
                    </div>
                    <div className="submit">
                        <button className="btn_default" onClick={redirectLogin} id="button_repeat">
                            Повторить авторизацию
                        </button>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="content">
            </div>
        )
    }
}

export default Verification
