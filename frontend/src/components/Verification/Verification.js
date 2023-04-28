import React, {useState, useEffect} from "react"
import "./Verification.css"
import { Button } from "react-bootstrap"
import axios from "axios";
//import CookieLib from "../../cookielib-main/index.js"
import CookieLib from "../../cookielib/index.js"

let result = 'await'  // 'await' is the default state, then becomes 'mode_success' or 'mode_expired'
//let mode = 'signup'
//let contact_type = 'email' // or tg for the future

function redirectSignUp() {
    window.location.pathname = "/signup"
}

function redirectLogin() {
    window.location.pathname = "/login"
}

const getStatus = async() => {
    let request_url = window.location.pathname;
    let request_id_encrypted = request_url.substring(request_url.lastIndexOf('/') + 1);
    //console.log(request_url);
    console.log('prev token: ', CookieLib.getCookieToken());
    if (request_url.includes('signup')) {
        //let url = 'http://127.0.0.1/registration/verify/' + request_id_encrypted;
        let url = '/registration/verify/' + request_id_encrypted;
        await axios.post(url, {
            request_id_encrypted: request_id_encrypted,
        }).then(response => {
            result = 'signup_success'
            console.log('post response: ', response);
            console.log('result in post then: ', result);
            //console.log(response.status);
            //console.log('token in response: ', response.data('token'));
            console.log('token in response: ', response.data.token);
            //let token = response.data('token') // response.data.token???
            let token = response.data.token;
            CookieLib.setCookieToken(token);
            console.log('new token then: ', CookieLib.getCookieToken());
        }).catch(error => {
            console.log(error);
            result = 'signup_expired'
            console.log(error.response/*.status*/);
            console.log('result in post catch: ', result);
            console.log('new token catch: ', CookieLib.getCookieToken());
        });
    } else {
        //let url = 'http://127.0.0.1/login/verify/' + request_id_encrypted;
        let url = '/login/verify/' + request_id_encrypted;
        await axios.post(url, {
            request_id_encrypted: request_id_encrypted,
        }).then((response) => {
            result = 'login_success'
            console.log(response);
            console.log('result in post then: ', result);
            //console.log(response.status);
            //let token = response.data('token') // ?????????
            let token = response.data.token;
            CookieLib.setCookieToken(token)
            //console.log(CookieLib.getCookieToken());
        })
        .catch((error) => {
            result = 'login_expired'
            console.log(error.response/*.status*/);
            console.log('result in post catch: ', result);
            //console.log(CookieLib.getCookieToken());
        });
    }
}

const Verification = ({handleClick}) => {   // or login???
    const [res, setResult] = useState("await");
    useEffect(() => {
        getStatus().then(
            res => setResult(result));
            //result => setResult(res));
            console.log('res: ', res);
            console.log('result: ', result);
    //}/*,[res]*/);
    },[]); // does 1 request
    //},[res]);  // does 2 requests
    if (result === 'signup_success') {
        return (
            <div className="content">
                <div className="frame" style={{height: '340px'}}>
                    <div className="text_general" id="text_mode">
                        Email успешно подтвержден! Вы зарегистрированы и авторизованы.<br/>Тесты доступны на верхней
                        панели.<br/>Чтобы принять участие в исследовании, пожалуйста, заполните анкету.
                    </div>
                    <Button variant="success"
                            onClick={() => window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                            id="button_quiz">
                        Заполнить анкету
                    </Button>
                </div>
            </div>
        )
    } else if (result === 'signup_expired') {
        return (
            <div className="content">
                <div className="frame">
                    <div className="text_general" id="text_mode">
                        Срок действия ссылки истек.<br/> Пожалуйста, зарегистрируйтесь заново.
                    </div>
                    <Button variant="success" onClick={redirectSignUp} id="button_repeat">
                        Повторить регистрацию
                    </Button>
                </div>
            </div>
        )
    } else if (result === 'login_success') { // ПРОВЕРКА ЗАПОЛНЕННОСТИ АНКЕТЫ
        return (
            <div className="content">
                <div className="frame" style={{height: '340px'}}>
                    <div className="text_general" id="text_mode">
                        Вы авторизованы. Рады снова видеть вас на Burnout tester!<br/>Тесты доступны на верхней
                        панели.<br/>Чтобы принять участие в исследовании, пожалуйста, заполните анкету.
                    </div>
                    <Button variant="success"
                            onClick={() => window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                            id="button_quiz">
                        Заполнить анкету
                    </Button>
                </div>
            </div>
        )
    } else if (result === 'login_expired') {
        return (
            <div className="content">
                <div className="frame">
                    <div className="text_general" id="text_mode">
                        Срок действия ссылки истек.<br/> Пожалуйста, авторизуйтесь заново.
                    </div>
                    <Button variant="success" onClick={redirectLogin} id="button_repeat">
                        Повторить регистрацию
                    </Button>
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
