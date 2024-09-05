interface NavItem {
    value: string;
    path: string;
  }

const mainNavList:NavItem[]  = [{
value: '交易策略',
path: '/strategy/trade'
},{
value: '投资者',
path: '/strategy/investor'
},{
value: '风控',
path: '/strategy/risk-manage'
}]

export {
    mainNavList
  };