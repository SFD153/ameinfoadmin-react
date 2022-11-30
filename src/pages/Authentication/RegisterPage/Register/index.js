import React from 'react';
import RegisterForm from './RegisterForm';
import './style.scss';

class Register extends React.Component {
  state = {};

  componentDidMount() {
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
  }

  componentWillUnmount() {
    document.getElementsByTagName('body')[0].style.overflow = '';
  }

  render() {
    return (
      <div className="main-login main-login--fullscreen">
        <div className="main-login__block main-login__block--extended pb-0">
          <div className="row">
            <div className="col-xl-12">
              <div className="main-login__block__promo text-black text-center">
                <div className="main-login__header__logo">
                  <a href="javascript: void(0);">
                    <img src="resources/images/login/logo.png" alt="AMEinfo" />
                  </a>
                </div>
              </div>
              <div className="main-login__block__inner">
                <div className="main-login__block__form">
                  <RegisterForm email={this.state.restoredEmail} />
                </div>
                <div className="main-login__block__sidebar">
                  <h4 className="main-login__block__sidebar__title text-white">
                    <strong>Mediaquest &#8482;</strong>
                    <br />
                  </h4>
                  <div className="main-login__block__sidebar__item">
                    Reproduction of news articles, photos, videos or any other content in whole or
                    in part in any form or medium without written permission from Mediaquest Corp.
                    is prohibited.
                  </div>
                  <div className="main-login__block__sidebar__place">
                    <i className="icmn-location mr-3" />
                    Dubai, UAE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
