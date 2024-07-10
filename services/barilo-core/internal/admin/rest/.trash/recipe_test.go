package rest_test

import (
	"bufio"
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/pedrosantosbr/barilo/internal/rest"
	"github.com/pedrosantosbr/barilo/internal/rest/resttesting"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/go-cmp/cmp"
)

func TestRecipe_List(t *testing.T) {
	t.Parallel()

	type output struct {
		expectedStatus int
		expected       interface{}
		target         interface{}
	}

	tests := []struct {
		name   string
		setup  func(*resttesting.FakeRecipeService)
		output output
	}{
		{
			"OK: 200",
			func(s *resttesting.FakeRecipeService) {
				s.GetRecipesStub = func(ctx context.Context, ingredients string) (<-chan []byte, <-chan error, error) {
					outc := make(chan []byte)
					errc := make(chan error)
					go func() {
						defer close(outc)
						defer close(errc)

						tomatos := []string{"Event 1: tomato", "Event 2: tomato", "Event 3: tomato", "Event 4: tomato", "Event 5: tomato", "Event 6: tomato", "Event 7: tomato", "Event 8: tomato", "Event 9: tomato", "Event 10: tomato"}

						for _, t := range tomatos {
							outc <- []byte(t)
						}

						outc <- []byte("[DONE]")
					}()
					return outc, errc, nil
				}
			},
			output{
				expectedStatus: http.StatusOK,
				expected:       []string{"Event 1: tomato", "Event 2: tomato", "Event 3: tomato", "Event 4: tomato", "Event 5: tomato", "Event 6: tomato", "Event 7: tomato", "Event 8: tomato", "Event 9: tomato", "Event 10: tomato", "[DONE]"},
				target:         []string{},
			},
		},
	}

	// -

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			router := newRouter()
			svc := &resttesting.FakeRecipeService{}
			tt.setup(svc)

			rest.NewRecipeHandler(svc).Register(router)

			// -

			res := doRequest(router, httptest.NewRequest(http.MethodGet, "/api/recipes/suggestions", nil))

			if res.Header.Get("Content-Type") != "text/event-stream" {
				t.Fatalf("expected content type text/event-stream, actual %s", res.Header.Get("Content-Type"))
			}

			if tt.output.expectedStatus != res.StatusCode {
				t.Fatalf("expected code %d, actual %d", tt.output.expectedStatus, res.StatusCode)
			}

			scanner := bufio.NewScanner(res.Body)
			for scanner.Scan() {
				line := scanner.Text()
				if strings.HasPrefix(line, "data:") {
					// Process the event data
					eventData := strings.TrimPrefix(line, "data:")
					eventData = strings.TrimSpace(eventData)
					tt.output.target = append(tt.output.target.([]string), eventData)
				}
			}

			if err := scanner.Err(); err != nil && err != io.EOF {
				t.Fatalf("error reading response body: %v", err)
			}

			// -

			test := test{
				expected: tt.output.expected,
				target:   tt.output.target,
			}

			if !cmp.Equal(test.expected, test.target) {
				t.Fatalf("expected results don't match: %s", cmp.Diff(test.expected, test.target))
			}
		})
	}
}

type test struct {
	expected interface{}
	target   interface{}
}

func doRequest(router *chi.Mux, req *http.Request) *http.Response {
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	return rr.Result()
}

func newRouter() *chi.Mux {
	r := chi.NewRouter()
	r.Use(render.SetContentType(render.ContentTypeJSON))

	return r
}
