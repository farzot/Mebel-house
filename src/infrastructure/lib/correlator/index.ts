import { createNamespace } from "cls-hooked";
import * as uuid from "uuid";

const store = createNamespace("correlation-id-namespace");

const CORRELATION_ID_KEY = "correlation-id";

function withId(fn: Function, id: string) {
	try {
		store.run(() => {
			store.set(CORRELATION_ID_KEY, id || uuid.v4());
			fn();
		});
	} catch (error) {
		console.error(error);
	}
}

function getId() {
	try {
		return store.get(CORRELATION_ID_KEY);
	} catch (error) {
		console.error(error);
		return null;
	}
}

const correlator = {
	withId,
	getId,
	bindEmitter: store.bindEmitter.bind(store),
	bind: store.bind.bind(store),
};

export default correlator;
