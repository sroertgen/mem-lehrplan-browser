<script>
	import { uriMappings } from '$lib/config';
	import { uri2label, toggleFilter, toggleElement, selectedElements, lookupLabel } from '$lib/db';
	import { getElementInfo } from '$lib/utils';

	/** @typedef {import('./types.js').ResultItem} ResultItem */

	export let result;
	export let search;

	function highlightText(text, word) {
		try {
			if (!word) return text;
			const parts = text.split(new RegExp(`(${word})`, 'gi'));
			return parts
				.map((part) =>
					part.toLowerCase() === word.toLowerCase()
						? `<span class="underline decoration-indigo-500 text-black bg-yellow-300">${part}</span>`
						: part
				)
				.join('');
		} catch (e) {
			console.error(e);
			return text;
		}
	}

	$: highlightedText = (text) => highlightText(text, search);
</script>

<div class="card card-border w-full min-w-full bg-[#FEF3E9] md:w-3/4">
	<div class="card-body">
		{#await getElementInfo(result.s.value) then element}
			<!-- Bundesland und Fach -->
			<div class="flex justify-between">
				{#each element.state as state}
					<div
						onclick={() => toggleFilter('states', state)}
						class="self-center rounded-lg bg-[#FBD022] p-1 text-sm"
					>
						{$uri2label[state.uri.value]}
					</div>
				{/each}
				<div class="flex gap-1">
					{#each element.schoolType as schoolType}
						<span class="self-center rounded-lg bg-[#FBD022] p-1"
							>{#await lookupLabel(schoolType.value) then name}
								{name}
							{/await}
						</span>
					{/each}
					{#each element.subject as subject}
						<div
							onclick={() => toggleFilter('subjects', subject)}
							class="self-center rounded-lg bg-[#FBD022] p-1"
						>
							{$uri2label[subject.uri.value]}
						</div>
					{/each}
				</div>
			</div>

			<div class="flex flex-col md:flex-row md:items-center md:justify-between">
				<!-- Type -->
				<a
					href={`/b/${encodeURIComponent(result.s.value)}`}
					class="card-title truncate hover:underline"
				>
					{element?.type?.map((e) => uriMappings[e.value] || null).filter((e) => e != null)}
				</a>
				<!-- Klassenstufe -->
				<div class="flex flex-col gap-2 md:flex md:flex-row">
					{#each element.classLevel as level}
						<div class="h-6 w-6 rounded-full bg-[#FBD022] text-center">
							{$uri2label[level.uri.value]?.split(' ')[1] ||
								level.value?.split('/')[level.value.split('/').length - 1] ||
								''}
						</div>
					{/each}
				</div>
			</div>
			<!-- Label -->
			<p>{@html highlightedText(element.label?.[0].value)}</p>
			<p>Aus Lehrplan: {element.lp[0].value}</p>
			<div class="card-actions justify-end">
				<!-- Select Element -->
				<label class="flex flex-row items-center gap-2">
					<input
						class="checkbox"
						onclick={() => toggleElement(result.s.value)}
						type="checkbox"
						checked={$selectedElements.find((e) => e === result.s.value)}
					/>
					Für Suche auswählen
				</label>
				<a href={`/b/${encodeURIComponent(result.s.value)}`} class="btn btn-primary">Details</a>
			</div>
		{/await}
	</div>
</div>
