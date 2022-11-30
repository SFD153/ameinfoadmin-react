import React from 'react';
import { dispatch } from 'stores';
import { push } from 'react-router-redux';
import agent from 'utils/agent';
import ResetForm from './ResetForm';
import './style.scss';

class Reset extends React.Component {
  state = {};

  async componentDidMount() {
    await this.verifyActivationCode();
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
  }

  componentWillUnmount() {
    document.getElementsByTagName('body')[0].style.overflow = '';
  }

  async verifyActivationCode() {
    const code = this.props.match.params.code;
    try {
      await agent.post(`/verify/${code}`);
    } catch (e) {
      dispatch(push('/login'));
    }
  }

  render() {
    return (
      <div className="main-forgot main-forgot--fullscreen">
        <div className="main-forgot__block main-forgot__block--extended pb-0">
          <div className="row">
            <div className="col-xl-12">
              <div className="main-forgot__block__promo text-black text-center">
                <div className="main-forgot__header__logo">
                  <a href="javascript: void(0);">
                    <img src="resources/images/login/logo.png" alt="AMEInfo" />
                  </a>
                </div>
              </div>
              <div className="main-forgot__block__inner">
                <div className="main-forgot__block__form">
                  <ResetForm code={this.props.match.params.code} />
                </div>
                <div className="main-forgot__block__sidebar">
                  <h4 className="main-forgot__block__sidebar__title text-white">
                    <strong>Mediaquest &#8482;</strong>
                    <br />
                  </h4>
                  <div className="main-forgot__block__sidebar__item">
                    Reproduction of news articles, photos, videos or any other content in whole or
                    in part in any form or medium without written permission from Mediaquest Corp.
                    is prohibited.
                  </div>
                  <div className="main-forgot__block__sidebar__place">
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

export default Reset;
