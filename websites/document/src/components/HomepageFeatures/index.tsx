import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  imgSrc: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '数据模型',
    imgSrc: require('@site/static/img/data-model.png').default,
    description: (
      <>
        针对 Redux 封装了一套简易的 API ，将 Redux 的 reducer 切片抽象成数据模型，简化状态管理。
      </>
    ),
  },
  {
    title: '路由与缓存',
    imgSrc: require('@site/static/img/page-route.png').default,
    description: (
      <>
        基于 history Api 设计了用于优化 React 应用前进后退体验的缓存方案，提供页面级缓存以及路由跳转方法判断等方法。
      </>
    ),
  },
  {
    title: '逻辑控制器',
    imgSrc: require('@site/static/img/controller.png').default,
    description: (
      <>
        提供了一种 class + hook 的方式来编写你的业务逻辑，拥抱 hooks 的同时，也能使用 class 的方式组织业务代码。让业务逻辑更加简洁，隔离性更好。
      </>
    ),
  },
];

function Feature({title, imgSrc, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={imgSrc} className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
