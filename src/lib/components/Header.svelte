<script>
	import { sideBarFilterOpen, sideBarElementOpen } from '$lib/db';
	import Menu from '$lib/icons/Menu.svelte';
	import X from '$lib/icons/X.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
</script>

<div class="navbar bg-[#FE7235] shadow-sm">
	<div class="flex">
		<button
			id="sidebarButton"
			class="btn btn-square btn-ghost drawer-button"
			onclick={() => ($sideBarFilterOpen = !$sideBarFilterOpen)}
		>
			{#if $sideBarFilterOpen}
				<X />
			{:else}
				<Menu />
			{/if}
		</button>
	</div>
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">Lehrplan Navigator</a>
	</div>
	<div class="absolute left-1/2 w-full max-w-md -translate-x-1/2 transform">
		<SearchBar />
	</div>
	<button
		id="sidebarButton"
		class="btn btn-square btn-ghost drawer-button"
		onclick={() => ($sideBarElementOpen = !$sideBarElementOpen)}
	>
		{#if $sideBarElementOpen}
			<X />
		{:else}
			<Menu />
		{/if}
	</button>
</div>
