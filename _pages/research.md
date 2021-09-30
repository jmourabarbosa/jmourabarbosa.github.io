---
layout: archive
title: "Research Interests"
permalink: /research/
author_profile: true
---

## Within- and across-area neural dynamics involved in complex behavior 

*Early-selection of relevant auditory stimuli through context-dependent population dynamics*.  

Understanding how stable neural circuits implement flexible, context-dependent behavior is crucial to understand cognition. Specifically, how different brain areas interact to select relevant stimuli within irrelevant ones remains to be fully elucidated.

In this project, we are focusing on the population dynamics of previously recorded neurons in the primary auditory cortex (A1) and medial prefrontal cortex (mPFC), while rats exhibited flexible, context-dependent behavior. We found that A1 represented relevant and irrelevant auditory stimulus features (location and pitch) during both contexts, but mPFC exclusively represented the relevant feature for the ongoing context. This raised the question of how these areas interacted to effectively select the relevant stimulus in PFC, specifically assuming a fixed readout from A1.

To address this question, we trained recurrent neural networks (RNN) with back-propagation on a similar task and found that the relevant and irrelevant stimuli were equally represented, similar to A1. We reverse-engineered the mechanism employed by these networks, predicting that different populations that selectively integrate the relevant stimuli can be identified by different context-specific activity during the pre-stimulus period. In line with these predictions, we found two distinct populations in A1, each discriminating more strongly the relevant go-stimuli in its preferred context. Finally, we built a multi-area RNN in which decision and context was communicated feedforward and feedback, respectively, through fixed channels, inspired by the communication subspace hypothesis. 

See [this short talk at COSYNE](https://youtu.be/PH7hptJoZpA) about the otherwise unpubished project (note: back then, only about A1 and overall outdated). 


This work is in colaboration with [Srdjan Ostojic](https://scholar.google.fr/citations?user=EYC4De8AAAAJ), [Yves Boubenec](https://scholar.google.fr/citations?user=2cY7YoUAAAAJ) and [Remi Proveil](https://scholar.google.fr/citations?user=SOgCmD8AAAAJ&hl=fr).

*Across-area synchronized dynamics support the integration of independently stored features in multi-item working memory*. 

We built a biophysical neural network model composed of two one-dimensional attractor networks, one for color and another one for location, simulating the storage of  each feature in a different cortical area [Barbosa et al CCCN 2019](https://bit.ly/32FicoJ). Within each area, gamma oscillations were induced during bump attractor activity through the interplay of fast recurrent excitation and slower feedback inhibition. As a result, different memorized items were held at different phases of the network’s intrinsic oscillation. These two areas were then reciprocally connected via weak cortico-cortical excitation, accomplishing binding between color and location through the synchronization of pairs of bumps across the two connected areas. Encoding and decoding of specific color-location associations was accomplished through rate coding, overcoming a long-standing limitation of binding through temporal coding. In some simulations, swap errors arose: “color bumps” abruptly changed their phase relationship with “location bumps”. This model, which keeps the explanatory power that is characteristic of similar attractor models, specifies a plausible mechanism for feature binding and makes specific predictions about swap errors that are testable at behavioral and neurophysiological levels. 

This work is in colaboration with [Kartik Sreenivasan](https://nyuad.nyu.edu/en/academics/divisions/science/faculty/kartik-sreenivasan.html). Current work involves collecting MEG data to falsify predictions layed out by our model.

## The neural mechanisms of working memory 

During my PhD I mostly focus the plausible neural mechanisms for working memory [Barbosa. Journal of Neuroscience (2017)](https://jmourabarbosa.github.io/files/Barbosa2017.pdf) and in particular whether working memory is supported by activity-silent mechanisms [Barbosa et al (2021)](https://psyarxiv.com/qv6fu/), such as short-term plasticity. Through a combination of human and monkey neurophysiological experiments, data analysis and computational models, we unveiled the neurophysiological basis of the interference of previous, irrelevant memories on currently maintained memories - the so-called serial dependence [Barbosa et al Nature Neuroscience (2020)](https://jmourabarbosa.github.io/publications/). We found that a tight interaction between persistent neuronal firing and short-term plasticity in the prefrontal cortex supports working memory and is expressed behaviorally in serial dependence, both in monkeys and human subjects. 

Currently I am interested in how different prefronta-cortecis, each in a different brain hemisphere, interact to produce serial dependence. This is work lead by [Melanie Tschiersch](https://braincircuitsbehavior.org/people) in colaboration with [Albert Compte](https://braincircuitsbehavior.org/people) and [Matthew A. Smith](https://www.cmu.edu/bme/People/Faculty/profile/msmith.html).


## Synaptic basis of reduced serial dependence in patients

We found that serial dependence is dramatically reduced in schizophrenia and anti-NMDAR encephalitis patients [Stein\*, Barbosa\* et al Nature Communications (2020)](https://jmourabarbosa.github.io/publications/); others have shown a similar reduction of serial dependence for patients with autism [Lieder et al Nature Neuroscience (2019)](https://www.nature.com/articles/s41593-018-0308-9?WT.feed_name=subjects_cognitive-neuroscience). When we incorporated our monkey and human neurophysiological findings in a biophysically-constrained computational model of working memory, it allowed us to quantitatively explain serial dependence disruption in all of the aforementioned populations on the basis of disrupted short-term plasticity mechanisms. 

By associating these diseases with short-term plasticity, our work is opening new lines of research to understand their mechanistic basis [Stein\*, Barbosa\* et al 2021](https://psyarxiv.com/uxg2a).

Currently I am interested in studying the neural basis of cognitive decline during ageing. I have found that serial dependence (as well as working memory precision) decreases progressively throughout healthy aging. This is unpublished work, but see a [short talk here](https://youtu.be/dkFhOdXSvRo).

