import React from 'react';
import { connect } from 'react-redux';
import { logout } from 'ducks/app';
import { Menu, Dropdown, Avatar } from 'antd';
import { Link } from 'react-router-dom';

const mapDispatchToProps = dispatch => ({
  logout: event => {
    event.preventDefault();
    dispatch(logout());
  },
});

const mapStateToProps = state => ({
  userInfo: state.app.userInfo,
});

@connect(
  mapStateToProps,
  mapDispatchToProps,
)
class ProfileMenu extends React.Component {
  render() {
    const { userInfo, logout } = this.props;
    const menu = (
      <Menu selectable={false}>
        <Menu.Item>
          <div className="rfq__widget__system-status__item">
            <strong>Hello, {userInfo.username}</strong>
            <div>
              <strong>Role:</strong> {userInfo.role}
            </div>
          </div>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item>
          <div className="rfq__widget__system-status__item">
            <strong>Email:</strong> {userInfo.email}
          </div>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item>
          <Link to="/users/your-profile">
            <i className="topbar__dropdownMenuIcon icmn-user" /> Edit Profile
          </Link>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item>
          <a href="javascript: void(0);" onClick={logout}>
            <i className="topbar__dropdownMenuIcon icmn-exit" /> Logout
          </a>
        </Menu.Item>
      </Menu>
    );
    return (
      <div className="topbar__dropdown d-inline-block">
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <a className="ant-dropdown-link" href="/">
            <Avatar
              className="topbar__avatar topbar__avatar-size"
              shape="square"
              size="large"
              icon="user"
              src={userInfo.avatar ? userInfo.avatar.link : null}
            />
          </a>
        </Dropdown>
      </div>
    );
  }
}

export default ProfileMenu;
