---
slug: scoping-dynamic-bindings
title: Using toDynamicValue() without an explicit scope can lead to performance issues
authors: [mscharley]
tags: [explainer]
---

Unless configured differently, the default scope for a container is transient scope. This means that every request to
the container which needs this binding will run your dynamic binding again every time it is needed in that request which
can quickly become a performance bottleneck if that request is on a hot path in your application. Consider using a more
cacheable scope for your dynamic bindings if possible, however any explicit scope for the binding will silence the
warning.

<!-- truncate -->

```typescript title="example.ts"
const module: interfaces.ContainerModule = (bind) => {
	const factory = async () => {
		await sleep(500);
		return 'Hello world!';
	};

	// Will generate a warning
	bind(token).toDynamicValue(factory);

	// Will not generate a warning
	bind(token).inTransientScope().toDynamicValue(factory);
	bind(token).inRequestScope().toDynamicValue(factory);
	bind(token).inSingletonScope().toDynamicValue(factory);
};
```

If you have any questions or want to discuss this further, then check out [the Discussions thread][thread].

[thread]: https://github.com/mscharley/dot/discussions/80
