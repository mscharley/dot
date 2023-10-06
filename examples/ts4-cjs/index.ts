import { createContainer, Token } from '@mscharley/dot';

const name = new Token<string>('name');
const c = createContainer();

c.bind(name).toConstantValue('world');
c.get(name)
	.then((n) => {
		if (n !== 'world') {
			throw new Error('Unable to retrieve an item successfully');
		}
		console.log('Success!');
	})
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	});
