<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	let { children } = $props();
</script>

<div class="w-full">
	<Header />
	{@render children()}
</div>
