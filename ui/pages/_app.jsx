import '../styles/global.css';
import App from 'next/app';
import Store from '../redux/store';
import Layout from '../components/Layout';
import { Provider } from 'react-redux';
import { initContract } from '../backed/util';
import { onUpdateWallet } from '../redux/action/wallet';

export default class MyApp extends App {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        window.nearInitPromise = initContract()
            .then(({ contract, currentUser, nearConfig, walletConnection }) => {
                Store.dispatch(
                    onUpdateWallet({
                        contract,
                        currentUser,
                        nearConfig,
                        walletConnection,
                    }),
                );
                this.setState({
                    isConnected: true,
                });
            })
            .catch(console.error);
    }

    render() {
        const { Component, pageProps } = this.props;
        let props = { ...pageProps, ...this.state };
        return (
            <>
                <div className="form_bg" />
                {this.state.isConnected ? (
                    <Provider store={Store}>
                        <Layout {...props}>
                            <Component {...props} />
                        </Layout>
                    </Provider>
                ) : null}
            </>
        );
    }
}
