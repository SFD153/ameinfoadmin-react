import React from 'react';
import ProfileMenu from './ProfileMenu';
import './style.scss';

class TopBar extends React.Component {
  render() {
    return (
      <div className="topbar">
        <div className="topbar__left" />
        <div className="topbar__right">
          <ProfileMenu />
        </div>
      </div>
    );
  }
}

export default TopBar;
