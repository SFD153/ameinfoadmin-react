import React from 'react';
import { Collapse, Checkbox, Input, Button, Form, Card, notification, Tabs, Icon } from 'antd';
import { Row, Col } from 'antd';
import agent from 'utils/agent';
import find from 'lodash/find';
import { get, setEach } from 'utils/setting';
import 'react-sortable-tree/style.css';
import isEmpty from 'lodash/isEmpty';
import MinimalTheme from 'react-sortable-tree-theme-minimal';
import ModalUpdate from './ModalUpdate';
import SortableTree, { removeNodeAtPath, changeNodeAtPath } from 'react-sortable-tree';

const Search = Input.Search;
const Panel = Collapse.Panel;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formLayout: 'horizontal',
      url: 'http://',
      linkText: '',
      pages: [],
      posts: [],
      categories: [],
      originalPages: [],
      originalPosts: [],
      originalCategories: [],
      selectedPages: [],
      selectedAllPages: false,
      selectedPosts: [],
      selectedAllPosts: false,
      selectedCategories: [],
      selectedAllCategories: false,
      treeData: [],
      menuHeaderTreeData: [],
      menuFooterTreeData: [],
      menuTopbarTreeData: [],
      currentMenuKey: 'menuHeaderTreeData',
      checked: false,
      settings: [],
      settingParams: {
        select: 'name,value',
        where: {
          name: ['menu_header', 'menu_footer', 'menu_topbar'],
        },
      },
      postParams: {
        select: 'id,title,slug',
      },
      pageParams: {
        select: 'id,title,slug',
        perPage: '40',
      },
      categoryParams: {
        select: 'id,name,slug',
        perPage: '40',
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeCheckBox = this.handleChangeCheckBox.bind(this);
    this.handleClickSelectAllPages = this.handleClickSelectAllPages.bind(this);
    this.handleClickSelectAllPosts = this.handleClickSelectAllPosts.bind(this);
    this.handleClickSelectAllCategories = this.handleClickSelectAllCategories.bind(this);
    this.handleClickAddMenuPages = this.handleClickAddMenuPages.bind(this);
    this.handleClickAddMenuPosts = this.handleClickAddMenuPosts.bind(this);
    this.handleClickAddMenuCustomLinks = this.handleClickAddMenuCustomLinks.bind(this);
    this.handleClickAddMenuCategories = this.handleClickAddMenuCategories.bind(this);
    this.handleSearchPages = this.handleSearchPages.bind(this);
    this.handleSearchPosts = this.handleSearchPosts.bind(this);
    this.handleSearchCategories = this.handleSearchCategories.bind(this);
    this.handleClickSaveMenu = this.handleClickSaveMenu.bind(this);
    this.handleChangeMenu = this.handleChangeMenu.bind(this);
    this.removeNode = this.removeNode.bind(this);
  }

  async componentDidMount() {
    const { settingParams, postParams, pageParams, categoryParams } = this.state;
    let settings = [];
    let pages = [];
    let posts = [];
    let categories = [];
    let treeData = [];
    let menuHeaderTreeData = [];
    let menuFooterTreeData = [];
    let menuTopbarTreeData = [];

    try {
      let responseSetting = await agent.get('/settings').query(settingParams);
      let responsePost = await agent.get('/posts').query(postParams);
      let responsePage = await agent.get('/pages').query(pageParams);
      let responseCategory = await agent.get('/categories').query(categoryParams);
      settings = responseSetting.body.results;
      posts = responsePost.body.results;
      pages = responsePage.body.results;
      categories = responseCategory.body.results;
      let menuHeader = get(settings, 'menu_header');
      let menuFooter = get(settings, 'menu_footer');
      let menuTopBar = get(settings, 'menu_topbar');
      menuFooter = isEmpty(menuFooter) ? [] : JSON.parse(menuFooter);
      menuTopBar = isEmpty(menuTopBar) ? [] : JSON.parse(menuTopBar);
      treeData = isEmpty(menuHeader) ? [] : JSON.parse(menuHeader);
      menuHeaderTreeData = treeData;
      menuFooterTreeData = menuFooter;
      menuTopbarTreeData = menuTopBar;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get menu',
      });
    }

    this.setState({
      posts: posts,
      pages: pages,
      categories: categories,
      originalPosts: posts,
      originalPages: pages,
      originalCategories: categories,
      settings: settings,
      treeData: treeData,
      menuHeaderTreeData: menuHeaderTreeData,
      menuFooterTreeData: menuFooterTreeData,
      menuTopbarTreeData: menuTopbarTreeData,
    });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeCheckBox(value, name) {
    this.setState({ [name]: value });
  }

  handleClickSelectAllPages() {
    const { pages, selectedAllPages } = this.state;

    let listOfPage = pages.map(page => page.id);

    this.setState({
      selectedPages: selectedAllPages ? [] : listOfPage,
      selectedAllPages: !selectedAllPages,
    });
  }

  handleClickSelectAllPosts() {
    const { posts, selectedAllPosts } = this.state;

    let listOfPost = posts.map(post => post.id);

    this.setState({
      selectedPosts: selectedAllPosts ? [] : listOfPost,
      selectedAllPosts: !selectedAllPosts,
    });
  }

  handleClickSelectAllCategories() {
    const { categories, selectedAllCategories } = this.state;

    let listOfCategory = categories.map(category => category.id);

    this.setState({
      selectedCategories: selectedAllCategories ? [] : listOfCategory,
      selectedAllCategories: !selectedAllCategories,
    });
  }

  handleClickAddMenuPages() {
    const { pages, selectedPages, treeData } = this.state;

    let listOfPages = selectedPages.map(pageId => {
      let page = find(pages, { id: pageId });
      return {
        type: 'page',
        id: page.id,
        title: page.title,
        slug: page.slug,
      };
    });
    this.setState({
      selectedPages: [],
      treeData: treeData.concat(listOfPages),
    });
  }

  handleClickAddMenuPosts() {
    const { posts, selectedPosts, treeData } = this.state;

    let listOfPosts = selectedPosts.map(postId => {
      let post = find(posts, { id: postId });
      return {
        type: 'post',
        id: post.id,
        title: post.title,
        slug: post.slug,
      };
    });

    this.setState({
      selectedPosts: [],
      treeData: treeData.concat(listOfPosts),
    });
  }

  handleClickAddMenuCustomLinks() {
    const { linkText, url, treeData } = this.state;

    let tree = treeData.concat({
      type: 'link',
      title: linkText,
      url: url,
    });

    this.setState({
      linkText: '',
      url: 'http://',
      treeData: tree,
    });
  }

  handleClickAddMenuCategories() {
    const { categories, selectedCategories, treeData } = this.state;

    let listOfCategories = selectedCategories.map(categoryId => {
      let category = find(categories, { id: categoryId });
      return {
        type: 'category',
        id: category.id,
        title: category.name,
        slug: category.slug,
      };
    });

    this.setState({
      selectedCategories: [],
      treeData: treeData.concat(listOfCategories),
    });
  }

  handleSearchPages(event) {
    const { originalPages } = this.state;

    this.setState({
      posts: originalPages.filter(page => page.title.indexOf(event.target.value) > -1),
    });
  }

  handleSearchPosts(event) {
    const { originalPosts } = this.state;

    this.setState({
      posts: originalPosts.filter(post => post.title.indexOf(event.target.value) > -1),
    });
  }

  handleSearchCategories(event) {
    const { originalCategories } = this.state;

    this.setState({
      categories: originalCategories.filter(
        category => category.name.indexOf(event.target.value) > -1,
      ),
    });
  }

  async handleClickSaveMenu() {
    const {
      settings,
      treeData,
      currentMenuKey,
      menuHeaderTreeData,
      menuFooterTreeData,
      menuTopbarTreeData,
    } = this.state;

    let menuKey = currentMenuKey.replace('TreeData', '');
    let options = {
      menuHeader: JSON.stringify(menuHeaderTreeData),
      menuFooter: JSON.stringify(menuFooterTreeData),
      menuTopbar: JSON.stringify(menuTopbarTreeData),
    };

    options[menuKey] = JSON.stringify(treeData);

    let listOfSettings = setEach(settings, options);

    try {
      await agent.put('/settings').send(listOfSettings);
      notification.open({
        type: 'success',
        message: 'Success',
        description: 'Save successfully',
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not update menu',
      });
    }
  }

  handleChangeMenu(activeKey) {
    this.setState({
      [this.state.currentMenuKey]: this.state.treeData,
      treeData: this.state[activeKey],
      currentMenuKey: activeKey,
    });
  }

  getFormItemLayout(formLayout) {
    return formLayout === 'horizontal'
      ? {
          labelCol: { span: 6 },
          wrapperCol: { span: 18 },
        }
      : null;
  }

  removeNode(rowInfo) {
    const { node, treeIndex, path } = rowInfo;
    this.setState({
      treeData: removeNodeAtPath({
        treeData: this.state.treeData,
        path: path, // You can use path from here
        getNodeKey: ({ node: TreeNode, treeIndex: number }) => {
          return number;
        },
        ignoreCollapsed: false,
      }),
    });
  }

  renderReactSortableTree(treeData) {
    const getNodeKey = ({ treeIndex }) => treeIndex;

    return (
      <SortableTree
        treeData={treeData}
        theme={MinimalTheme}
        onChange={treeData => this.setState({ treeData })}
        rowHeight={50}
        generateNodeProps={rowInfo => ({
          buttons: [
            <ModalUpdate
              onEdit={({ title, url }) => {
                this.setState(state => ({
                  treeData: changeNodeAtPath({
                    treeData: state.treeData,
                    path: rowInfo.path,
                    getNodeKey,
                    newNode: { ...rowInfo.node, title, url },
                  }),
                }));
              }}
              rowInfo={rowInfo}
              treeData={treeData}
              render={show => (
                <div style={{ cursor: 'pointer' }} className="text-warning mr-2" onClick={show}>
                  <i className="fa fa-edit" />
                </div>
              )}
            />,
            <div
              style={{ cursor: 'pointer' }}
              className="text-danger mr-2"
              onClick={() => this.removeNode(rowInfo)}
            >
              <i className="fa fa-times" />
            </div>,
          ],
        })}
      />
    );
  }

  render() {
    const {
      formLayout,
      url,
      linkText,
      pages,
      posts,
      categories,
      selectedPages,
      selectedPosts,
      selectedCategories,
      originalPosts,
      originalPages,
      originalCategories,
      treeData,
    } = this.state;

    const panelContentPages = (
      <div>
        <Row>
          <Col>
            <Search placeholder="Input search text" onChange={this.handleSearchPages} />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedPages}
              onChange={value => this.handleChangeCheckBox(value, 'selectedPages')}
            >
              <Row>
                {pages.map(page => (
                  <Col span={24} key={page.id}>
                    <Checkbox value={page.id}>{page.title}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Col>
        </Row>
        <Row className="mt-2" type="flex" justify="space-around" align="middle">
          <Col xs={14} md={15}>
            <a
              href="javascript:void(0)"
              className="text-primary"
              onClick={this.handleClickSelectAllPages}
            >
              Select All
            </a>
          </Col>
          <Col xs={10} md={9}>
            <Button onClick={this.handleClickAddMenuPages}>Add to Menu</Button>
          </Col>
        </Row>
      </div>
    );

    const panelContentPosts = (
      <div>
        <Row>
          <Col>
            <Search placeholder="Input search text" onChange={this.handleSearchPosts} />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedPosts}
              onChange={value => this.handleChangeCheckBox(value, 'selectedPosts')}
            >
              <Row>
                {posts.map(post => (
                  <Col span={24} key={post.id}>
                    <Checkbox value={post.id}>{post.title}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Col>
        </Row>
        <Row className="mt-2" type="flex" justify="space-around" align="middle">
          <Col xs={14} md={15}>
            <a
              href="javascript:void(0)"
              className="text-primary"
              onClick={this.handleClickSelectAllPosts}
            >
              Select All
            </a>
          </Col>
          <Col xs={10} md={9}>
            <Button onClick={this.handleClickAddMenuPosts}>Add to Menu</Button>
          </Col>
        </Row>
      </div>
    );

    const panelContentCategories = (
      <div>
        <Row>
          <Col>
            <Search placeholder="Input search text" onChange={this.handleSearchCategories} />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedCategories}
              onChange={value => this.handleChangeCheckBox(value, 'selectedCategories')}
            >
              <Row>
                {categories.map(category => (
                  <Col span={24} key={category.id}>
                    <Checkbox value={category.id}>{category.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Col>
        </Row>
        <Row className="mt-2" type="flex" justify="space-around" align="middle">
          <Col xs={14} md={15}>
            <a
              href="javascript:void(0)"
              className="text-primary"
              onClick={this.handleClickSelectAllCategories}
            >
              Select All
            </a>
          </Col>
          <Col xs={10} md={9}>
            <Button onClick={this.handleClickAddMenuCategories}>Add to Menu</Button>
          </Col>
        </Row>
      </div>
    );

    const formItemLayout = this.getFormItemLayout(formLayout);

    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>Menu</strong>
          </span>
        </div>
        <Row>
          <Col xs={24} md={8}>
            <Col xs={24} md={22}>
              <Collapse accordion>
                <Panel header="Pages" key="1">
                  {originalPages.length <= 0 ? 'No items.' : panelContentPages}
                </Panel>
                <Panel header="Posts" key="2">
                  {originalPosts.length <= 0 ? 'No items.' : panelContentPosts}
                </Panel>
                <Panel header="Custom Links" key="3">
                  <Form layout={formLayout}>
                    <FormItem label="URL" {...formItemLayout}>
                      <Input name="url" value={url} onChange={this.handleChange} />
                    </FormItem>
                    <FormItem label="Link Text" {...formItemLayout}>
                      <Input name="linkText" value={linkText} onChange={this.handleChange} />
                    </FormItem>
                  </Form>
                  <div className="text-right">
                    <Button onClick={this.handleClickAddMenuCustomLinks}>Add to Menu</Button>
                  </div>
                </Panel>
                <Panel header="Categories" key="4">
                  {originalCategories.length <= 0 ? 'No items.' : panelContentCategories}
                </Panel>
              </Collapse>
            </Col>
          </Col>
          <Col xs={24} md={16}>
            <Card>
              <Tabs type="card" onChange={this.handleChangeMenu}>
                <TabPane tab="Header" key="menuHeaderTreeData">
                  <Card
                    title="Header"
                    extra={
                      <Button type="primary" onClick={this.handleClickSaveMenu}>
                        Save Menu
                      </Button>
                    }
                  >
                    <p>
                      Drag each item into the order you prefer. Click the arrow on the right of the
                      item to reveal additional configuration options.
                    </p>
                    <div style={{ height: 1400 }}>{this.renderReactSortableTree(treeData)}</div>
                    <br />
                  </Card>
                </TabPane>
                <TabPane tab="Footer" key="menuFooterTreeData">
                  <Card
                    title="Footer"
                    extra={
                      <Button type="primary" onClick={this.handleClickSaveMenu}>
                        Save Menu
                      </Button>
                    }
                  >
                    <p>
                      Drag each item into the order you prefer. Click the arrow on the right of the
                      item to reveal additional configuration options.
                    </p>
                    <div style={{ height: 1400 }}>{this.renderReactSortableTree(treeData)}</div>
                    <br />
                  </Card>
                </TabPane>
                <TabPane tab="Topbar" key="menuTopbarTreeData">
                  <Card
                    title="Topbar"
                    extra={
                      <Button type="primary" onClick={this.handleClickSaveMenu}>
                        Save Menu
                      </Button>
                    }
                  >
                    <p>
                      Drag each item into the order you prefer. Click the arrow on the right of the
                      item to reveal additional configuration options.
                    </p>
                    <div style={{ height: 1400 }}>{this.renderReactSortableTree(treeData)}</div>
                    <br />
                  </Card>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Menu;
