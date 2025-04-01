<script>
	import { currentPage, db, totalResults } from '$lib/db';
</script>

<div class="join">
	<button
		disabled={$currentPage <= 0}
		onclick={() => {
			currentPage.update((cp) => cp - 1);
		}}
		class="join-item btn">«</button
	>
	<button class="join-item btn">{$currentPage + 1}</button>
	<button
		onclick={() => {
			currentPage.update((cp) => cp + 1);
		}}
		class="join-item btn">»</button
	>
</div>
