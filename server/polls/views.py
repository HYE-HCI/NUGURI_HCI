from django.db.models import F
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.views import generic
from django.utils import timezone

from .models import Choice, Question

import base64
import openai
from pathlib import Path

openai.api_key="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"

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def get_completion(image_url):
    prompt = f"You are a fashion expert and personal color consultant and you must answer in Korean. Your task is to analyze an image of a top (upper body garment) and provide two types of responses:\
        1. A brief description (2-3 sentences) of the garment's characteristics, style, and how well it suits a Summer Cool Light complexion.\
        2. A concise summary in the following format:\
        Garment type:, Color:, Texture:, Suitability for personal color: (1: Good, 2: Neutral, 3: Poor)\
        When analyzing the image, consider these characteristics that suit a Summer Cool Light complexion:\
        - Colors: Pastel tones, light colors, colors with a grayish undertone\
        - Saturation: Medium to low\
        - Brightness: High\
        - Contrast: Low"
    image_path = image_url
    base64_image = encode_image(image_path)
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            max_tokens=300,
        )
        
        if response.choices:
            return response.choices[0].message.content
        else:
            return "No response was received from GPT API."
    except Exception as e:
        return f"An error occurred: {str(e)}"
    
def get_tts(prompt):
    speech_file_path = Path(__file__).parent / "static/polls/sounds/speech.mp3"
    with openai.audio.speech.with_streaming_response.create(
        model="tts-1-hd",
        voice="nova",
        input=prompt,
    ) as response:
        response.stream_to_file(speech_file_path)

def query_view(request):
    if request.method == 'POST':
        image_url = str(request.POST.get('prompt'))
        response = get_completion(image_url)
        get_tts(response)
        return JsonResponse({'response':response})
    return render(request, 'polls/gpt.html')







class IndexView(generic.ListView):
    template_name = "polls/index.html"
    context_object_name = "latest_question_list"

    def get_queryset(self):
        """Return the last five published questions."""
        return Question.objects.order_by("-pub_date")[:5]


class DetailView(generic.DetailView):
    model = Question
    template_name = "polls/detail.html"
    def get_queryset(self):
        """
        Excludes any questions that aren't published yet.
        """
        return Question.objects.filter(pub_date__lte=timezone.now())

class ResultsView(generic.DetailView):
    model = Question
    template_name = "polls/results.html"


def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    try:
        selected_choice = question.choice_set.get(pk=request.POST["choice"])
    except (KeyError, Choice.DoesNotExist):
        # Redisplay the question voting form.
        return render(
            request,
            "polls/detail.html",
            {
                "question": question,
                "error_message": "You didn't select a choice.",
            },
        )
    else:
        selected_choice.votes = F("votes") + 1
        selected_choice.save()
        # Always return an HttpResponseRedirect after successfully dealing
        # with POST data. This prevents data from being posted twice if a
        # user hits the Back button.
        return HttpResponseRedirect(reverse("polls:results", args=(question.id,)))
    

def get_queryset(self):
    """
    Return the last five published questions (not including those set to be
    published in the future).
    """
    return Question.objects.filter(pub_date__lte=timezone.now()).order_by("-pub_date")[
        :5
    ]